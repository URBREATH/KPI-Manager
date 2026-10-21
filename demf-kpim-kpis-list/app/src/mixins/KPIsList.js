import axios from "axios";

export default {
  data() {
    return {
      apiUrl: this.kpisListConfig.api,
      shareDialogActive: false,
    };
  },
  methods: {
    //fetch the list of KPIs and store them in the KPIs array
    getKPIsList() {
      this.loader = true;
      const apiBase = this.apiUrl.replace(/\/+$/, "");
      axios
        .get(`${apiBase}/${this.realm}/kpi`, {
          withCredentials: true,
        })
        .then(async (response) => {
          this.KPIs = await this.reconcileOrionPublicationStatus(response.data.data || []);
          document.dispatchEvent(new CustomEvent("hide-welcome-loader"));
          this.loader = false;
        })
        .catch((err) => {
          this.setError(err, false);
          this.loader = false;
        });
    },

    async reconcileOrionPublicationStatus(kpis) {
      const apiBase = this.apiUrl.replace(/\/+$/, "");
      const reconciled = [];
      const batchSize = 5;

      for (let start = 0; start < kpis.length; start += batchSize) {
        const batch = kpis.slice(start, start + batchSize);
        const results = await Promise.all(batch.map(async (kpi) => {
          try {
            const response = await axios.get(
              `${apiBase}/${this.realm}/kpi/orion/${encodeURIComponent(kpi.id)}/status`,
              { withCredentials: true, timeout: 15000 },
            );
            const result = response.data || {};

            if (result.published) {
              const publication = {
                published: true,
                entityId: result.entityId || result.entity?.id || `urn:ngsi-ld:KPI:${kpi.id}`,
                entityUrl: result.entityUrl || kpi.orionPublication?.entityUrl,
                publishedAt: kpi.orionPublication?.publishedAt || new Date().toISOString(),
              };

              if (
                !kpi.orionPublication?.published ||
                kpi.orionPublication.entityId !== publication.entityId ||
                kpi.orionPublication.entityUrl !== publication.entityUrl
              ) {
                try {
                  await axios.patch(
                    `${apiBase}/${this.realm}/kpi/orion-publication/${encodeURIComponent(kpi.id)}`,
                    { entityId: publication.entityId, entityUrl: publication.entityUrl },
                    { withCredentials: true, timeout: 15000 },
                  );
                } catch (metadataError) {
                  console.error("Could not reconcile Orion publication metadata:", metadataError.response?.data || metadataError.message);
                }
              }

              return { ...kpi, orionPublished: true, orionPublication: publication };
            }

            if (kpi.orionPublication?.published) {
              try {
                await axios.delete(
                  `${apiBase}/${this.realm}/kpi/orion-publication/${encodeURIComponent(kpi.id)}`,
                  { withCredentials: true, timeout: 15000 },
                );
              } catch (metadataError) {
                console.error("Could not clear stale Orion publication metadata:", metadataError.response?.data || metadataError.message);
              }
            }
            return { ...kpi, orionPublished: false, orionPublication: { published: false } };
          } catch (error) {
            console.warn(`Could not check Orion publication status for KPI ${kpi.id}:`, error.response?.data || error.message);
            return { ...kpi, orionPublished: Boolean(kpi.orionPublication?.published) };
          }
        }));
        reconciled.push(...results);
      }

      return reconciled;
    },

    closeCreateKPI() {
      this.dialogCreate = false;
      this.resetDialog();
      this.$refs.createForm.resetValidation();
    },

    //called when clicking on the save button - closes the dialog and goes to the definition page
    confirmSaveKpi() {
      if (this.validateCreateForm()) {
        //initialize the the definition object, otherwise it will be undefined
        this.sessionItem.definition = {
          geolocation: {
            latitude: "",
            longitude: "",
          },
          selected: [],
        };
        sessionStorage.setItem("kpi", JSON.stringify(this.sessionItem));
        this.$router.push({
          path: "editor/definition",
        });
        this.closeCreateKPI();
      }
    },

    routeToDefinition(item) {
      sessionStorage.setItem("kpi", JSON.stringify(item));
      this.$router.push({
        path: "editor/definition",
      });
    },

    routeToCompare(item) {
      sessionStorage.setItem("kpi", JSON.stringify(item));
      this.$router.push({
        path: "compare",
      });
    },

routeToPublishKpi(item) {
  sessionStorage.setItem("kpi", JSON.stringify(item));
  this.$router.push({
    path: "/publish/dataset",  
  });
},

    //called when clicking on the bin - stores the kpi's id and opens the dialog
    openDeleteKPI(item) {
      this.id = item.id;
      this.dialogDelete = true;
    },

    //called when clicking on the delete button inside the dialog
    deleteKpiConfirm() {
      axios
        .delete(`${this.apiUrl}/${this.realm}/kpi/` + this.id, {
          withCredentials: true,
        })
        .then(() => {
          this.getKPIsList();
          this.snackbar = true;
          this.snackbarText = this.$t("strings.delete-kpi-text");
        })
        .catch((err) => {
          this.setError(err, false);
          this.loader = false;
        });
      this.closeDeleteKPI();
    },

    //close the delete kpi dialog
    closeDeleteKPI() {
      this.dialogDelete = false;
      this.resetDialog();
    },

    openDuplicateKPI(item) {
      this.duplicateItem = Object.assign({}, item);
      this.dialogDuplicate = true;
    },

    duplicateKPI() {
      this.loader = true;
      axios
        .post(
          `${this.apiUrl}/${this.realm}/kpi/clone`,
          {
            ...this.duplicateItem,
          },
          {
            withCredentials: true,
          }
        )
        .then(() => {
          this.dialogDuplicate = false;
          this.getKPIsList();
        })
        .catch((err) => {
          this.setError(err, false);
          this.loader = false;
        });
    },

    routeToPublishOnFrostServer(item) {
      axios
        .post(
          `${this.apiUrl}/${this.realm}/frostserver/publish/${item.id}`,
          {item},
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          const result = response.data || {};
          this.snackbarColor = "success";
          this.snackbarText = this.$t(result.messageKey || "strings.frostPublishSuccess", result.messageParams || {});
          this.snackbar = true;

          const referenceLabels = {
            sensor: "labels.frostSensor",
            thing: "labels.frostThing",
            location: "labels.frostLocation",
            observedProperty: "labels.frostObservedProperty",
            datastream: "labels.frostDatastream",
            observation: "labels.frostObservation",
          };
          this.frostReferences = Object.entries(result.frost?.references || {})
            .filter(([, url]) => typeof url === "string" && url.length > 0)
            .map(([key, url]) => ({ key, url, label: referenceLabels[key] }));

          if (this.frostReferences.length > 0) this.frostPublishDialog = true;
        })
        .catch((err) => {
          this.snackbarColor = "error";
          this.snackbarText = this.$t(err.response?.data?.messageKey || "strings.frostPublishFailed");
          this.snackbar = true;
          console.error("FROST publication error details:", err.response?.data?.details || err.message);
        });
},

    publishKpi(item) {
      this.snackbarActionUrl = "";
      const apiBase = this.apiUrl.replace(/\/+$/, "");
      axios
        .post(
          `${apiBase}/${this.realm}/kpi/publish/${item.id}`,
          {item},
          {
            withCredentials: true,
          }
        )
        .then(async (response) => {
          const result = response.data || {};
          this.snackbarActionUrl = result.entityUrl || "";
          item.orionPublished = true;
          item.orionPublication = {
            published: true,
            entityId: result.entityId,
            entityUrl: result.entityUrl,
          };
          try {
            await this.saveOrionPublication(item, result);
            item.orionPublication = {
              published: true,
              entityId: result.entityId,
              entityUrl: result.entityUrl,
              publishedAt: new Date().toISOString(),
            };
            this.snackbarColor = "success";
            this.snackbarText = this.$t(result.messageKey || "strings.orionPublishSuccess");
          } catch (error) {
            this.snackbarColor = "warning";
            this.snackbarText = this.$t("strings.orionPublicationTrackingFailed");
            console.error("Could not save Orion publication metadata:", error.response?.data || error.message);
          }
          this.snackbar = true;
        })
        .catch(async (err) => {
          const responseData = err.response?.data || {};
          if (err.response?.status === 409) {
            item.orionPublished = true;
            item.orionPublication = {
              published: true,
              entityId: responseData.entityId,
              entityUrl: responseData.entityUrl,
            };
          }
          if (err.response?.status === 409 && responseData.entityId && responseData.entityUrl) {
            try {
              await this.saveOrionPublication(item, responseData);
              item.orionPublished = true;
              item.orionPublication = {
                published: true,
                entityId: responseData.entityId,
                entityUrl: responseData.entityUrl,
                publishedAt: new Date().toISOString(),
              };
            } catch (metadataError) {
              console.error("Could not save existing Orion publication metadata:", metadataError.response?.data || metadataError.message);
            }
          }
          this.snackbarColor = "error";
          this.snackbarText = this.$t(
            responseData.messageKey ||
            (err.response?.status === 409 ? "strings.orionPublishAlreadyExists" : "strings.orionPublishFailed"),
          );
          this.snackbarActionUrl = responseData.entityUrl || "";
          this.snackbar = true;
          console.error("Orion publication error details:", responseData.details || err.message);
        });
    },

    async saveOrionPublication(item, publication) {
      const apiBase = this.apiUrl.replace(/\/+$/, "");
      await axios.patch(
        `${apiBase}/${this.realm}/kpi/orion-publication/${item.id}`,
        { entityId: publication.entityId, entityUrl: publication.entityUrl },
        { withCredentials: true },
      );
    },

    async deleteKpiFromOrion(item) {
      if (!window.confirm(this.$t("strings.orionDeleteConfirm", { name: item.name }))) return;
      const apiBase = this.apiUrl.replace(/\/+$/, "");
      this.loader = true;
      try {
        try {
          await axios.delete(`${apiBase}/${this.realm}/kpi/orion/${item.id}`, { withCredentials: true });
        } catch (error) {
          if (error.response?.status !== 404) throw error;
        }
        await axios.delete(`${apiBase}/${this.realm}/kpi/orion-publication/${item.id}`, { withCredentials: true });
        item.orionPublished = false;
        item.orionPublication = { published: false };
        this.snackbarColor = "success";
        this.snackbarText = this.$t("strings.orionDeleteSuccess");
        this.snackbarActionUrl = "";
        this.snackbar = true;
      } catch (error) {
        this.snackbarColor = "error";
        this.snackbarText = this.$t(error.response?.data?.messageKey || "strings.orionDeleteFailed");
        this.snackbar = true;
        console.error("Orion KPI deletion failed:", error.response?.data?.details || error.message);
      } finally {
        this.loader = false;
      }
    },

    closeDuplicateKPI() {
      this.dialogDuplicate = false;
    },

    openShareForm(kpi) {
      this.shareItem = {};
      this.shareItem.id = kpi.id;
      this.shareItem.name = kpi.name;
      this.shareItem.isOwner = kpi.ownerId === this.loggedUserId;
      this.shareDialogActive = true;
    },

    closeShareForm() {
      this.shareDialogActive = false;
    },

    //getContext
    async getContext() {
      try {
        const response = await axios.get(`${this.apiUrl}/${this.realm}/users/contexts`, {
          withCredentials: true,
        });
        this.contexts = response.data.map((item) => {
          return item.name;
        });
      } catch (error) {
        this.setError(error, false);
      } finally {
        this.loading = false;
      }
    },

    //closes the dialog for multiple deletion
    closeDeleteMultipleKPIs() {
      this.dialogDeleteMultiple = false;
      this.resetDialog();
    },

    deleteMultipleKpis() {
      let baseUrl = `${this.apiUrl}/dev/kpi/`;
      this.selected.forEach((item, i) => {
        if (i === this.selected.length - 1) {
          baseUrl = baseUrl + item.id;
        } else {
          baseUrl = baseUrl + item.id + ",";
        }
      });

      axios
        .delete(baseUrl, {
          withCredentials: true,
        })
        .then(() => {
          this.getKPIsList();
          this.snackbar = true;
          this.snackbarText = this.$t("strings.delete-multiple-text");
        })
        .catch((err) => {
          this.setError(err, false);
          this.loader = false;
        });
      this.selected = [];
      this.closeDeleteMultipleKPIs();
    },

    //call this function on a form to check if the form is valid
    validateCreateForm() {
      return this.$refs.createForm.validate();
    },

    //reset the creation dialog after closing it
    resetDialog() {
      this.$nextTick(() => {
        this.sessionItem = Object.assign(
          {},
          {
            name: "",
            description: "",
            context: "",
          }
        );
      });
    },
    routeToKPI(item) {
      sessionStorage.setItem("kpi", JSON.stringify(item));
      this.$router.push({
        path: `/editor/summary`,
      });
    },
    activateSnackbar(val, text) {
      this.snackbar = val;
      this.snackbarText = text;
    },
  },
};
