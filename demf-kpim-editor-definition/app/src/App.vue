<template>
  <v-layout>
    <v-main :class="containerState">
      <v-card
        class="pt-0 mb-2 px-3"
        ref="mainContainerDefinition"
        id="main-container-definition"
        flat
      >
        <div class="d-flex overflow-auto">
          <descriptionComponent
          class="tour-description"
            :parentDescription="sessionItem.description"
            @writeDescription="writeDescription"
            :kpimEditorConfig="kpimEditorConfig"
            :realm="realm"
            :parentHeight="containerHeight"
          ></descriptionComponent>

          <creationMapContainer
          class="tour-map"
            :kpimEditorConfig="kpimEditorConfig"
            :parentSessionItem="this.sessionItem"
            @writeGeolocation="writeGeolocation"
            :parentLoading="loading"
            :parentHeight="containerHeight"
          ></creationMapContainer>
        </div>
        <kpiMeasuresComponent
        
        
          :kpimEditorConfig="kpimEditorConfig"
          :realm="realm"
          :parentSelected="selected"
          @writeSelected="writeSelected"
          :parentLoading="loading"
          @writeLoading="writeLoading"
          :parentSessionItem="sessionItem"
          @writeSessionItem="writeSessionItem"
          :parentHeight="containerHeight"
          class="mb-auto tour-measures"
        ></kpiMeasuresComponent>
        <div class="d-flex mx-2 pt-auto">
               <v-btn
    variant="text"
    size="small"
    color="primary"
    @click="startTour"
  >
    {{ $t("tour.help") }}
  </v-btn>
          <v-btn variant="outlined" color="secondary" class="me-auto px-2" @click="routeToHome">
            {{ $t("labels.cancel") }}
          </v-btn>
          <v-btn
        
            :disabled="!selected.length"
            variant="elevated"
            color="secondary"
            class="ml-2 text-white px-2 tour-continue"
            @click="next"
          >
            {{ $t("labels.continue") }}
          </v-btn>
        </div>
      </v-card>
    </v-main>
  </v-layout>
</template>

<script>
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import version from "../version";
import commonMethods from "./mixins/commonMethods";
import mapMethods from "./mixins/mapMethods";
import descriptionComponent from "./components/descriptionComponent.vue";
import CreationMapContainer from "./components/creationMapContainer.vue";
import kpiMeasuresComponent from "./components/kpiMeasuresComponent.vue";
import { startKpiTour } from "./editorDefinitionTour";
export default {
  name: "demf-kpim-editor-definition",
  mixins: [events, utils, commonMethods, mapMethods],
  props: ["kpimEditorConfig", "realm"],
  components: {
    descriptionComponent,
    CreationMapContainer,
    kpiMeasuresComponent,
  },
  data: function () {
    return {
      appVersion: version,
      containerState: "expanded",
      loggedUserId: "",

      loading: false,
      selected: [],
      validFields: false,

      sessionItem: {},
    };
  },

  mounted() {
    console.log("Mounted demf-kpi-editor-definition v", this.appVersion);
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

    this.sessionItem = Object.assign({}, JSON.parse(sessionStorage.getItem("kpi")));
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.updateContainerHeight);
  },

  methods: {
      startTour() {
    this.$nextTick(() => {
      startKpiTour(this.$t);
    });
  },
    setEditableStep(step, value) {
      document.dispatchEvent(
        new CustomEvent("editable-steps", {
          detail: { step, value },
        })
      );
    },

    writeGeolocation(childGeolocation) {
      this.sessionItem.definition.geolocation = { ...childGeolocation };
    },
    writeDescription(description) {
      this.sessionItem.description = description;
    },
    writeValidFields(validFields) {
      this.validFields = validFields;
    },
    writeLoading(loading) {
      this.loading = loading;
    },
    writeSelected(selected) {
      this.selected = selected;
    },
    writeSessionItem(sessionItem) {
      this.sessionItem = sessionItem;
    },
  },
};
</script>
<style scoped>
main.expanded {
  margin-left: 56px;
}
main.reduced {
  margin-left: 256px;
}
#main-container-definition {
  overflow-y: hidden;
}
main #main-container-definition {
  margin-top: 170px;
  /*ControlPanel total height - toolbar - stepper - Footer*/
  height: calc(100vh - 64px - 104px - 40px);
  overflow-y: auto;
}
@media only screen and (max-height: 768px) {
  main #main-container-definition {
    margin-top: 170px;
    height: calc(100vh - 64px - 104px - 40px);
  }
}
</style>
