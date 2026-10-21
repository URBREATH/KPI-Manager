<template>
  <v-layout>
    <v-main :class="containerState">
      <v-container
        class="pt-0"
        ref="mainContainerSummary"
        id="main-container-summary"
        :fluid="true"
      >
        <v-card class="mx-auto d-flex flex-column" flat>
          <v-row>
            <v-col cols="12" class="py-0">
              <dashboard-component
                :kpimEditorConfig="kpimEditorConfig"
                :realm="realm"
                :kpi="kpi"
                :validFormula="validFormula"
                @writeCronJobStatus="writeCronJobStatus"
                :storedKpiStatus="storedKpiStatus"
              ></dashboard-component>
            </v-col>
          </v-row>
          <v-card-actions class="mt-4 pa-1">
            <v-btn color="secondary" variant="outlined" @click="abortRule()">
              {{ $t("labels.cancel") }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="secondary" @click="routeTo('/editor/dashboard')" variant="elevated">
              {{ $t("labels.back") }}
            </v-btn>
            <v-btn
              color="secondary"
              :disabled="!validFormula || (kpi.dependencyStatus !== 'active' && kpiId)"
              @click="saveAndContinue()"
              variant="elevated"
            >
              {{ kpiId ? $t("labels.update") : $t("labels.save") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </v-layout>
  <!-- Overlay -->
  <div v-if="loading" class="overlay">
    <v-progress-circular color="secondary" indeterminate></v-progress-circular>
  </div>
</template>

<script>
import axios from "axios";
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import version from "../version";
import DashboardComponent from "@/components/DashboardComponent.vue";
export default {
  name: "KpiEditorSummary",
  components: { DashboardComponent },
  mixins: [events, utils],
  props: ["kpimEditorConfig", "realm"],
  data: function () {
    return {
      appVersion: version,
      containerState: "expanded",
      loggedUserId: "",
      kpi: {},
      storedKpiStatus: "",
      apiUrl: this.kpimEditorConfig.api,
      validFormula: false,
      loading: false,
    };
  },

  beforeMount() {
    this.kpi = JSON.parse(sessionStorage.getItem("kpi"));
    this.storedKpiStatus = this.kpi.formula.job.status;
  },

  mounted() {
    console.log("Mounted demf-kpi-editor-summary v", this.appVersion);
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

    this.isFormulaValid();
  },

  computed: {
    kpiId() {
      return this.getKpiId();
    },
  },

  methods: {
    setEditableStep(step, value) {
      document.dispatchEvent(
        new CustomEvent("editable-steps", {
          detail: { step, value },
        })
      );
    },
    //Goes to a new path
    routeTo(newPath) {
      this.$router.push({
        path: newPath,
      });
    },
    //Abort the rule creation
    abortRule() {
      sessionStorage.removeItem("kpi");
      this.routeTo(`/kpis`);
    },

    //Saves the updated Rule to sessionStorage and calls page routing
    saveAndContinue() {
      this.setEditableStep("summary", 1);
      this.kpiId ? this.updateKPI(this.kpi) : this.createKPI(this.kpi);
    },

    getKpiId() {
      return this.kpi?.id ? true : false;
    },

    createKPI(kpi) {
      this.loading = true;
      axios
        .post(
          `${this.apiUrl}/${this.realm}/kpi`,
          {
            ...kpi,
          },
          {
            withCredentials: true,
          }
        )
        .then(() => {
          this.abortRule();
        })
        .catch((err) => {
          this.setError(err, false);
          this.loading = false;
        });
    },

    async updateKPI(kpi) {
      this.loading = true;
      try {
        // Retrieve the saved KPI from session storage
        const savedKpiJson = sessionStorage.getItem("kpi");
        const savedKpi = savedKpiJson ? JSON.parse(savedKpiJson) : {};
        const savedStatus = savedKpi.formula?.job?.status;
        const actualStatus = kpi.formula.job.status;

        // Update KPI
        await axios.put(`${this.apiUrl}/${this.realm}/kpi/${kpi.id}`, kpi, { withCredentials: true });

        // Check if cronjob status needs updating
        if (savedStatus !== actualStatus) {
          const suspend = actualStatus === "RUNNING" ? false : true;
          const cronJobId = kpi.formula.job.cronJobId;
          const cronJobUrl = `${this.apiUrl}/${this.realm}/cronjob/${cronJobId}?suspend=${suspend}`;

          const response = await axios.patch(
            cronJobUrl,
            { status: actualStatus },
            { withCredentials: true }
          );

          if (response) {
            sessionStorage.setItem("kpi", JSON.stringify(kpi));
          }
        }

        this.abortRule();
      } catch (err) {
        this.setError(err, false);
      } finally {
        this.loading = false;
      }
    },

    writeCronJobStatus(status) {
      this.kpi.formula.job.status = status;
    },

    isFormulaValid() {
      this.validFormula = false;
      this.kpi.definition.selected.forEach((item) =>
        this.kpi.formula.details.forEach((detail) => {
          if (item.name === detail.name) {
            this.validFormula = true;
          }
        })
      );
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
main #main-container-summary {
  margin-top: 170px;
  /*ControlPanel total height - toolbar - stepper - Footer*/
  height: calc(100vh - 64px - 104px - 40px);
  overflow-y: auto;
}
@media only screen and (max-height: 768px) {
  main #main-container-summary {
    margin-top: 170px;
    height: calc(100vh - 64px - 104px - 40px);
  }
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5); /* Semi-transparent background */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* Ensure it's above all other content */
}
</style>
