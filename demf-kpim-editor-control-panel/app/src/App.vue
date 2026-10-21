<template>
  <v-app>
    <v-main :class="containerState">
      <v-container fluid>
        <AppBar
          :kpi="kpi"
          :realm="realm"
          :apiUrl="kpimEditorConfig.api"
          @snackbarEvent="snackbarEvent"
        />
        <WizardStepper
          :step="step"
          @update:step="(newValue) => (step = newValue)"
        />
        <!--Snackbar-->
        <v-snackbar v-model="snackbar" top color="green" timeout="5000">
          {{ snackbarText }}
          <template v-slot:action="{ attrs }">
            <v-btn color="white" text v-bind="attrs" @click="snackbar = false"
              >OK</v-btn
            >
          </template>
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import AppBar from "./components/AppBar.vue";
import WizardStepper from "./components/WizardStepper.vue";
import version from "../version";
export default {
  name: "KpiEditorControlPanel",
  components: { AppBar, WizardStepper },
  mixins: [events, utils],
  props: ["kpimEditorConfig", "realm"],
  data: function () {
    return {
      appVersion: version,
      containerState: "expanded",
      loggedUserId: "",
      snackbar: false,
      snackbarText: "",
      overlay: false,
      search: "",
      kpi: JSON.parse(sessionStorage.getItem("kpi")),
      page: location.pathname.split("/").pop(),
    };
  },
  created() {
    //Prevents a random navigation without necessary data
    if (!this.kpi) {
      this.$router.push("/"); //redirect to home
    }
  },
  mounted() {
    console.log("Mounted demf-kpi-editor-control-panel v", this.appVersion);
    this.loggedUserId = localStorage.getItem("loggedUserId");

    document.addEventListener("language-localstorage-changed", (event) => {
      this.setLocale(event.detail.storage);
    });

    this.containerState =
      localStorage.getItem("sidenav") === "opened" ? "reduced" : "expanded";

    document.addEventListener("sidenav-localstorage-changed", (event) => {
      this.containerState =
        event.detail.storage === "opened" ? "reduced" : "expanded";
    });

    //Path change listening
    this.$router.beforeEach((to, from, next) => {
      if (to.path.includes("definition")) {
        this.page = "definition";
      } else if (to.path.includes("formula")) {
        this.page = "formula";
      } else if (to.path.includes("dashboard")) {
        this.page = "dashboard";
      } else if (to.path.includes("summary")) {
        this.page = "summary";
      } else {
        this.page = to.path.split("/").pop();
      }
      next();
    });
  },
  watch: {
    page(val) {
      return val;
    },
  },
  computed: {
    //Sets step on Stepper for the visited page
    step() {
      let step = {
        definition: "1",
        formula: "2",
        dashboard: "3",
        summary: "4",
      };
      return this.page ? step[this.page] : 4;
    },
  },
  methods: {
    snackbarEvent(value, text) {
      this.snackbar = value;
      this.snackbarText = text;
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
</style>
