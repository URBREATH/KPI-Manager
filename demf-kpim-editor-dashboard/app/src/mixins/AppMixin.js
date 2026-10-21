// import axios from "axios";
export default {
  data() {
    return {
      tenantId: this.realm,
      apiUrl: this.kpimEditorConfig.api,
      selectedItem: {},
      settingItem: {},
    };
  },
  methods: {
    setEditableStep(step, value) {
      document.dispatchEvent(
        new CustomEvent("editable-steps", {
          detail: { step, value },
        }),
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
    //Updates chart type value
    updateChartType(chart) {
      this.sessionItem.dashboard.chart.type = chart.type;
    },
    //Saves the updated Rule to sessionStorage and calls page routing
    saveAndContinue() {
      sessionStorage.setItem("kpi", JSON.stringify(this.sessionItem));
      this.setEditableStep("dashboard", 3);
      this.routeTo("/editor/summary");
    },
  },
};
