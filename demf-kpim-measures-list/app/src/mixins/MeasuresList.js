import axios from "axios";
export default {
  data() {
    return {
      tenantId: this.realm,
      apiUrl: this.measuresListConfig.api,
      editedIndex: -1,
      editedItem: {},
      defaultItem: {
        name: this.$t("strings.new-measure"),
        context: "all-users",
        description: "",
        source: {
          type: "rest",
          uri: "",
          port: "",
          auth: {
            username: "",
            accessKey: "",
            databaseName: "",
          },
          spec: {
            method: "",
            jsonPath: "$.",
            body: "",
            headers: "",
            query: "",
            collectionName: "",
          },
        },
      },

      shareDialogActive: false,

      snackbar: false,
      snackbarText: "",
    };
  },

  watch: {
    "$i18n.locale": {
      handler: function () {
        this.defaultItem.name = this.$t("strings.new-measure");
      },
      immediate: true,
    },
  },

  methods: {
    //Check the state and add a style class to improve chip rendering
    isOutlined(status) {
      return this.setStyle(status) ? "outlinedStyle" : "";
    },
    //Checks if status is 'not-running' or 'unknown' to apply outline style
    setStyle(status) {
      return status === "not-running" || status == "unknown" ? true : false;
    },
    getMeasuresList() {
      this.loader = true;
      axios
        .get(this.apiUrl + "/" + this.tenantId + "/measures", this.opts)
        .then((response) => {
          this.measures = response.data.data;
          this.loader = false;
        })
        .catch((error) => {
          if (error.response.status === 401) {
            this.setError(error, false);
          }
          this.loader = false;
        });
    },
    //CREATE MEASURE
    createMeasure() {
      sessionStorage.setItem("measure", JSON.stringify(this.defaultItem));
      this.$router.push({
        path: `/measure`,
      });
    },
    //DELETE MEASURE
    deleteMeasure(item) {
      this.editedIndex = this.measures.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteMultipleMeasure() {
      this.dialogDelete = true;
      this.numDelete = 2;
    },
    deleteConfirm() {
      this.numDelete > 1 ? this.deleteMultipleMeasureConfirm() : this.deleteMeasureConfirm();
    },

    deleteMeasureConfirm() {
      this.loader = true;
      axios
        .delete(this.apiUrl + "/" + this.tenantId + "/measures/" + this.editedItem.id, this.opts)
        .then(() => {
          this.measures.splice(this.editedIndex, 1);
          this.getMeasuresList();
        })
        .catch((error) => {
          this.setError(error, false);
          this.loader = false;
        });
      this.closeDeleteMeasure();
    },
    closeDeleteMeasure() {
      this.dialogDelete = false;
      this.resetDialog();
    },

    deleteMultipleMeasureConfirm() {
      this.loader = true;
      let ids = this.extractMeasuresId();
      axios
        .delete(this.apiUrl + "/" + this.tenantId + "/measures/" + ids, this.opts)
        .then(() => {
          this.getMeasuresList();
        })
        .catch((error) => {
          this.setError(error, false);
          this.loader = false;
        });
      this.closeDeleteMeasure();
    },

    extractMeasuresId() {
      let ids = [];
      this.selected.forEach((el) => {
        ids.push(el);
      });
      return ids;
    },

    //Duplicate measure
    duplicateMeasureProject(item) {
      this.editedIndex = this.measures.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDuplicate = true;
    },
    duplicateMeasureConfirm() {
      this.duplicateMeasure();
      this.closeDuplicateMeasure();
    },
    duplicateMeasure() {
      this.loader = true;
      axios
        .post(this.apiUrl + "/" + this.tenantId + "/measures/clone/", this.editedItem, this.opts)
        .then(() => {
          this.getMeasuresList();
        })
        .catch((error) => {
          this.setError(error, false);
          this.loader = false;
        });
    },
    closeDuplicateMeasure() {
      this.dialogDuplicate = false;
      this.resetDialog();
    },

    //RESET variables
    resetDialog() {
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.numDelete = 1;
      });
    },

    //Open selected measure details (change page)
    routeToMeasure(item) {
      sessionStorage.setItem("measure", JSON.stringify(item));
      this.$router.push({
        path: `/measure/` + item.id,
      });
    },
    activateSnackbar(val, text) {
      this.snackbar = val;
      this.snackbarText = text;
    },

    resetSnackbar() {
      this.snackbar = false;
      this.snackbarText = "";
    },

    openShareForm(measure) {
      this.shareItem = {};
      this.shareItem.id = measure.id;
      this.shareItem.name = measure.name;
      this.shareDialogActive = true;
    },

    closeShareForm() {
      this.shareDialogActive = false;
    },
  },
};
