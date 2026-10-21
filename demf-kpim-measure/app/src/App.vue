

<template>
  <v-layout>
    <v-main :class="containerState">
      <v-container ref="mainContainerMeasure" id="main-container-measure" :fluid="true">
        <AppBar :measure="measure" :realm="realm" :apiUrl="apiUrl" />
        <v-card id="card_measure" class="mx-auto d-flex flex-column" flat height="100%">
          <v-card-text class="pa-0" :max-height="containerHeight">
            <v-row fill-height>
              <v-col cols="12" flex-grow-1>
                <MeasureForm
                  :measure="measure"
                  :measureId="measureId"
                  :measureTypes="measureTypes"
                  :contexts="contexts"
                  :containerHeight="containerHeight"
                  @form-validity-changed="isFormValid = $event"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="mt-auto">
           <v-btn
    variant="text"
    size="small"
    color="primary"
    @click="startTour"
  >
    {{ $t("tour.help") }}
  </v-btn>
   
            <v-btn color="secondary" variant="outlined" @click="cancelMeasure()">
              {{ $t("labels.cancel") }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="resetMeasure()" variant="elevated">
              {{ $t("labels.reset") }}
            </v-btn>
            <v-btn
              color="secondary"
              @click="preview()"
              variant="elevated"
              :loading="loading"
              :disabled="!isFormValid"
            >
              {{ $t("labels.preview") }}
            </v-btn>
          </v-card-actions>
        </v-card>
        <DialogPreviewMeasure
          :dialog="previewDialog"
          :measureResponse="measureResponse"
          :measureId="measureId"
          @previewDialog="confirmSave"
          @save="save"
        />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script>
import axios from "axios";
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import version from "../version";
import AppBar from "./components/AppBar.vue";
import MeasureForm from "./components/MeasureForm.vue";
import DialogPreviewMeasure from "./components/DialogPreviewMeasure.vue";
import { startMeasureTour } from "./measureTour";
export default {
  name: "KpimMeasure",
  components: { AppBar, MeasureForm, DialogPreviewMeasure },
  mixins: [events, utils],
  props: ["kpimMeasureConfig", "realm"],
  data: function () {
    return {
      isFormValid: false,
      appVersion: version,
      containerState: "expanded",
      loggedUserId: "",
      previewDialog: false,
      loading: false,
      measureId: this.getIdFromCurrentUrl(),
      measure: {},
      apiUrl: this.kpimMeasureConfig.api,
      containerHeight: "calc(" + this.updateContainerHeight() + " - 64px)",
      measureResponse: null,
      measureTypes: null,
      contexts: null,
    };
  },
  created() {
    this.getMeasureTypes();
    this.getIdFromCurrentUrl();
    this.getContexts();
  },
  beforeMount() {
    this.measure = JSON.parse(sessionStorage.getItem("measure"));
  },
  mounted() {
    console.log("Mounted demf-kpim-measure v", this.appVersion);
    this.loggedUserId = localStorage.getItem("loggedUserId");

    document.addEventListener("language-localstorage-changed", (event) => {
      this.setLocale(event.detail.storage);
    });

    this.containerState = localStorage.getItem("sidenav") === "opened" ? "reduced" : "expanded";

    document.addEventListener("sidenav-localstorage-changed", (event) => {
      this.containerState = event.detail.storage === "opened" ? "reduced" : "expanded";
    });

    document.addEventListener("toggle-overlay", (event) => {
      this.overlay = event.detail.released;
    });

    this.$nextTick(() => {
      this.updateContainerHeight(); // Updates initial dimensions
      window.addEventListener("resize", this.updateContainerHeight);
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateContainerHeight);
  },

  methods: {
    //startTour
     startTour() {
    this.$nextTick(() => {
      startMeasureTour(this.$t);
    });
  },
    //Goes to a new path
    routeTo(newPath) {
      this.$router.push({
        path: newPath,
      });
    },
    updateContainerHeight() {
      // Gets the container element from the ID
      const element = document.getElementById("main-container-measure");
      if (element) {
        // Get the CSS values of the element
        var elementCss = window.getComputedStyle(element);
        // Get the height value in pixels
        this.containerHeight = elementCss.getPropertyValue("height");
      } else {
        console.warn("Not Found: ", element);
        return "100vh";
      }
    },
    //Abort the rule creation
    cancelMeasure() {
      sessionStorage.removeItem("measure");
      this.routeTo(`/measures`);
    },

    //Shows the preview dialog
    async preview() {
      let cleanedForm = this.submitForm();
      console.log(cleanedForm);
      this.loading = true;
      try {
        const response = await axios.post(
          `${this.apiUrl}/${this.realm}/measures/fetch`,
          {
            ...cleanedForm,
          },
          {
            withCredentials: true,
          }
        );
        if (response) {
          this.measureResponse = response.data;

          if (!Array.isArray(this.measureResponse.data[0])) {
            //ensure that the data is always an array
            this.measureResponse.data = [this.measureResponse.data];
          }
          this.previewDialog = true;
          this.loading = false;
        }
      } catch (error) {
        this.setError(error, false);
      } finally {
        this.loading = false;
      }
    },

    //Saves the updated Rule to sessionStorage and calls page routing
    save() {
      let cleanedForm = this.submitForm();
      this.measureId ? this.updateMeasure(cleanedForm) : this.createMeasure(cleanedForm);
    },

    resetMeasure() {
      this.measure = JSON.parse(sessionStorage.getItem("measure"));
    },

    async createMeasure(editedItem) {
      this.loading = true;
      try {
        const response = await axios.post(
          `${this.apiUrl}/${this.realm}/measures`,
          {
            ...editedItem,
          },
          {
            withCredentials: true,
          }
        );
        if (response) {
          this.measureResponse = response.data;
          sessionStorage.removeItem("measure");
          this.$router.push({
            path: "/measures",
          });
        }
      } catch (error) {
        this.setError(error, false);
      } finally {
        this.loading = false;
      }
    },
    async updateMeasure(editedItem) {
      this.loading = true;
      try {
        const response = await axios.put(
          `${this.apiUrl}/${this.realm}/measures/${this.measureId}`,
          {
            ...editedItem,
          },
          {
            withCredentials: true,
          }
        );
        if (response) {
          this.measureResponse = response.data;
          sessionStorage.removeItem("measure");
          this.$router.push({
            path: "/measures",
          });
        }
      } catch (error) {
        this.setError(error, false);
      } finally {
        this.loading = false;
      }
    },

    confirmSave(val) {
      val ? this.cancelMeasure() : (this.previewDialog = false);
    },

    async getMeasureTypes() {
      try {
        const response = await axios.get(`${this.apiUrl}/${this.realm}/measure-types`, {
          withCredentials: true,
        });
        this.measureTypes = response.data.map((item) => {
          return Object({
            title: this.formatString(item),
            value: item,
          });
        });
      } catch (error) {
        this.setError(error, false);
      } finally {
        this.loading = false;
      }
    },
    //Ingests the measures values and returns a more readable string
    formatString(input) {
      // Split the input string by underscores
      const words = input.toLowerCase().split("-");
      // Capitalize the first letter of each word and join them with spaces
      const formattedString = words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toUpperCase())
        .join(" ");
      return formattedString;
    },
    async getContexts() {
      try {
        const response = await axios.get(`${this.apiUrl}/${this.realm}/users/contexts`, {
          withCredentials: true,
        });
         console.log('KpimMeasure - Risposta API per i contesti (raw):', response.data);
   
        this.contexts = response.data.map((item) => {
          return item.name;
        });
         console.log('KpimMeasure - Contesti mappati (formato v-select items):', this.contexts);
   
      } catch (error) {
        this.setError(error, false);
         console.error('KpimMeasure - Errore nel recupero dei contesti:', error);
      } finally {
        this.loading = false;
      }
    },

    getIdFromCurrentUrl() {
      // Get the current URL
      let url = window.location.href;
      // Split the URL into parts
      let parts = url.split("/");
      // Get the last part of the URL
      let id = parts[parts.length - 1];
      // If the last part is 'measure', there is no ID in the URL
      if (id === "measure") {
        id = null; // or you could set id to a custom message like 'No ID in the URL'
      }
      // Set the id data property
      this.measureId = id;
    },

    //Cleans an object by removing keys with values that are empty strings, null, or empty objects.
    cleanObject(obj) {
  for (let key in obj) {
    if (obj[key] && typeof obj[key] === "object") {
      this.cleanObject(obj[key]);
      // Rimuovi solo se è un oggetto vuoto **e non ha id**
      if (Object.keys(obj[key]).length === 0 && !obj[key].id) {
        delete obj[key];
      }
    } else if (obj[key] === "" || obj[key] === null) {
      delete obj[key];
    }
  }
},

    submitForm() {
      let formData = JSON.parse(JSON.stringify(this.measure));
      console.log(formData);
      this.cleanObject(formData);
      return formData;
    },
  },
};
</script>
<style scoped>
main.expanded {
  margin-left: 56px;
}
main.expanded header#upp-bar {
  margin-left: 56px;
  width: calc(100% - 56px) !important;
}
main.reduced {
  margin-left: 256px;
}
main.reduced header#upp-bar {
  margin-left: 256px;
  width: calc(100% - 256px) !important;
}
main #main-container-measure {
  margin-top: 0px;
  /*ControlPanel total height - toolbar - Footer*/
  height: calc(100vh - 64px - 40px);
  overflow-y: auto;
}
</style>
