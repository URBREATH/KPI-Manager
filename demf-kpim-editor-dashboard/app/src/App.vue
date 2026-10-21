<template>
  <v-layout>
    <v-main :class="containerState">
      <v-container
        ref="mainContainerDashboard"
        id="main-container-dashboard"
        :fluid="true"
        class="overflow-y-hidden"
      >
        <v-card id="card_dashboard" class="mx-auto d-flex flex-column" flat height="100%">
          <v-card-text class="pa-0">
            <v-row fill-height>
              <v-col cols="12" flex-grow-1>
                <DashboardComponent
                  :containerHeight="containerHeight"
                  :sessionItem="sessionItem"
                  @update-chart-type="updateChartType"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="mt-auto px-0">
            <v-btn color="secondary" variant="outlined" @click="abortKpi()">
              {{ $t("labels.cancel") }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="secondary" @click="routeTo('/editor/formula')" variant="elevated">
              {{ $t("labels.back") }}
            </v-btn>
            <v-btn color="secondary" @click="saveAndContinue()" variant="elevated">
              {{ $t("labels.continue") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script>
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import AppMixin from "@/mixins/AppMixin.js";
import version from "../version";
import DashboardComponent from "@/components/DashboardComponent.vue";
export default {
  name: "KpiEditorDashboard",
  components: { DashboardComponent },
  mixins: [AppMixin, events, utils],
  props: ["kpimEditorConfig", "realm"],
  data: function () {
    return {
      appVersion: version,
      containerState: "expanded",
      containerHeight: "100%",
      loggedUserId: "",
      sessionItem: {
        dashboard: {
          chart: {
            type: "bar",
          },
        },
      },
    };
  },

  beforeMount() {
    this.sessionItem = {
      ...this.sessionItem,
      ...JSON.parse(sessionStorage.getItem("kpi")),
    };
  },

  mounted() {
    console.log("Mounted demf-kpi-editor-dashboard v", this.appVersion);
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
      this.updateContainerHeight(); // Update dimensions
      window.addEventListener("resize", this.updateContainerHeight);
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateContainerHeight);
  },
  methods: {
    updateContainerHeight() {
      // Gets the container element from the ID
      const element = document.getElementById("main-container-dashboard");
      if (element) {
        // Get the CSS values of the element
        var elementCss = window.getComputedStyle(element);
        // Get the height value in pixels
        this.containerHeight = elementCss.getPropertyValue("height");
      } else {
        console.warn("Not Found: ", element);
      }
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
main #main-container-dashboard {
  margin-top: 170px;
  /*ControlPanel total height - toolbar - stepper - Footer*/
  height: calc(100vh - 64px - 104px - 40px);
  overflow-y: auto;
}
@media only screen and (max-height: 768px) {
  main #main-container-dashboard {
    margin-top: 170px;
    height: calc(100vh - 64px - 104px - 40px);
  }
}
</style>
