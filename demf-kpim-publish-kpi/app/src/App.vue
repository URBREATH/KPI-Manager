<template>
   <v-layout>
 
     <v-main :class="containerState">
      <v-container fluid>
     <AppBar
          :kpi="kpi"
          :realm="realm"
          :apiUrl="publishKpiConfig.api"
        />
        
        <!-- Toolbar -->
     <WizardStepper :realm="realm" :config= "publishKpiConfig"/>
      </v-container>
    </v-main>

</v-layout>
</template>
<script>

import AppBar from "./components/AppBar.vue";
import WizardStepper from "./components/WizardStepper.vue";
 

export default {
  name: "demf-kpim-publish-kpi",

  props: ["publishKpiConfig", "realm"],

  components: {
   // DistributionStep,
    //DatasetStep,
    AppBar,
    WizardStepper
  },

  data() {
    return {
      step: 1,
      dataset: {},
      distribution: [],
      sessionItem: {},
       containerState: "expanded",
      kpi: JSON.parse(sessionStorage.getItem("kpi")),
    };
  },
  

  mounted() {
    
    this.containerState = localStorage.getItem("sidenav") === "opened" ? "reduced" : "expanded";

    document.addEventListener("sidenav-localstorage-changed", (event) => {
      this.containerState = event.detail.storage === "opened" ? "reduced" : "expanded";
    });
    // 👉 prendi KPI da sessionStorage (come editor)
    const kpi = sessionStorage.getItem("kpi");

    if (kpi) {
      this.sessionItem = JSON.parse(kpi);
      this.mapToDatasetAndDistribution();
    }
  },

  methods: {
    mapToDatasetAndDistribution() {
      const kpi = this.sessionItem;

      // 🔹 DISTRIBUTIONS
      const distributions = [];

      // Measures → distributions
      if (kpi.measure && kpi.measure.length) {
        kpi.measure.forEach((m, index) => {
          distributions.push({
            id: `dist-measure-${index}`,
            title: m.name,
            description: m.description,
            accessUrl: [m.url],
            format: "application/json",
            license: "CC-BY",
          });
        });
      }

      // Historical KPI → distribution
      distributions.push({
        id: "dist-historical",
        title: `${kpi.name} historical data`,
        description: "Time series of KPI values",
        accessUrl: [
          `https://kpim-mid-dev.urbreath.tech/api/v1/...${kpi.name}`,
        ],
        format: "application/json",
        license: "CC-BY",
      });

      this.distribution = distributions;

      // 🔹 DATASET
      this.dataset = {
        id: `kpi-${kpi.id}`,
        title: kpi.name,
        description: kpi.description,
        publisher: this.realm,
        keyword: [kpi.name],
        datasetDistribution: distributions.map((d) => d.id),
        frequency: kpi.schedule || "unknown",
        accessRights: "non-public",
      };
    },

    async publish() {
      console.log("Publishing...", this.dataset, this.distribution);

      // 👉 qui poi chiamerai il tuo backend publisher
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
#main-container {
  height: calc(100vh - 104px);
  overflow-y: auto;
  background-color: white;
}
</style>