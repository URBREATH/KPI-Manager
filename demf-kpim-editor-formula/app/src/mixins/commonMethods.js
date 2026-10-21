import axios from "axios";
export default {
  data() {
    return {
      apiUrl: this.kpimEditorConfig.api,
      replacements: {
        "\\mu": "\\avg",
        Σ: "\\sum",
        "\\med": "\\median",
        Mo: "\\mode",
        "\\sigma": "\\stddev",

        // Add more replacements as needed
      },
      enableContinue: false,
    };
  },
  methods: {
    getKPIsList() {
      this.loading = true;
      axios
        .get(`${this.apiUrl}/${this.realm}/kpi`, {
          withCredentials: true,
        })
        .then((response) => {
          this.KPIs = response.data.data;
          this.loading = false;
        })
        .catch((err) => {
          this.setError(err, false);
          this.loading = false;
        });
    },

    getUnitMeasures() {
      axios
        .get(`${this.apiUrl}/${this.realm}/unit-measures`, {
          withCredentials: true,
        })
        .then((response) => {
          let tempArray = [];

          tempArray = response.data.map((item) => {
            return Object({
              title: this.$t(`measures.${item}`) + " - " + this.formatString(item).symbol,
              value: item,
            });
          });
          this.unitMeasures = tempArray;
        })
        .catch((err) => {
          this.setError(err, false);
        });
    },

    //redirect to Kpis list
    routeToHome() {
      this.$router.push({
        path: "/kpis",
      });
      sessionStorage.removeItem("kpi");
    },

    routeToDashboard() {
      this.sessionItem.definition.targetValue = parseFloat(this.sessionItem.definition.targetValue);
      let obj = this.sessionItem;
      obj.formula.expression = this.replaceValues(this.formula);
      this.sessionItem.formula.details.forEach((detail) => {
        // Trim spaces from the name
        let trimmedName = detail.name.replace(/\s+/g, "");

        // Replace the trimmed name in the expression with the original name
        obj.formula.expression = obj.formula.expression.replace(trimmedName, detail.name);
      });
      sessionStorage.setItem("kpi", JSON.stringify(obj));
      this.setEditableStep("formula", 1);
      this.$router.push({
        path: "/editor/dashboard",
      });
    },

    //Change page to Definition
    routeToDefinition() {
      this.$router.push({
        path: "/editor/definition",
      });
    },

    //ingests the formula as it is written by the user and returns a string for BE calculation
    replaceValues(formula) {
      let resultString = formula;

      for (const [key, value] of Object.entries(this.replacements)) {
        resultString = resultString.split(key).join(value);
      }

      return resultString;
    },

    //reverse the formula to be displayed in the editor
    reverseValues(formula) {
      let resultString = formula;

      for (const [key, value] of Object.entries(this.replacements)) {
        resultString = resultString.split(value).join(key);
      }

      return resultString;
    },

    grabUsedMeasures() {
      this.sessionItem.formula.details.length = 0;
      this.sessionItem.definition.selected.forEach((item) => {
        if (this.formula.trim().replace(/\s/g, "").includes(item.name.trim().replace(/\s/g, ""))) {
          this.sessionItem.formula.details.push(item);
        }
      });
    },

    getPreview(formula) {
      this.resultPreview = "";
      this.previewDialog = true;
      this.loading = true;
      this.grabUsedMeasures();
      if (this.sessionItem.formula.details.length === 0) {
        this.resultPreview = this.$t("errors.no-measures");
        this.loading = false;
        return;
      } else {
        let expression = this.replaceValues(formula);
        this.sessionItem.formula.details.forEach((detail) => {
          // Trim spaces from the name
          let trimmedName = detail.name.replace(/\s+/g, "");

          // Replace the trimmed name in the expression with the original name
          expression = expression.replaceAll(trimmedName, detail.name);
        });
        let body = {
          expression: expression,
          details: this.sessionItem.formula.details,
        };
        axios
          .post(`${this.apiUrl}/${this.realm}/formula/preview`, body, {
            withCredentials: true,
          })
          .then((response) => {
            if (response.data.data.error) {
              this.resultPreview = this.$t("labels.result", { result: response.data.data.error });
              this.loading = false;
            } else {
              this.resultPreview = this.$t("labels.result", { result: response.data.data.result });
              this.loading = false;
              //update the expression in the sessionStorage, otherwise the user can make changes to the formula even after validCheck and it will always be valid
              this.sessionItem.formula.expression = expression;
              this.enableContinue = true;
            }
          })
          .catch((err) => {
            this.setError(err, false);
            this.resultPreview = this.$t("errors.preview-error", { error: err.message || err });
            this.loading = false;
          });
      }
    },

    //called when the user types in the formula editor or when the formula changes
    //checks if the formula is valid and enables the continue button
    validCheck(val) {
      if (this.sessionItem.formula.expression !== "") {
        if (
          this.sessionItem.formula.expression.trim().replace(/\s/g, "") ===
          val.trim().replace(/\s/g, "")
        ) {
          this.enableContinue = true;
        } else {
          this.enableContinue = false;
        }
      }
    },

    //ingests the measures values and returns a more readable string
    formatString(input) {
      const unitSymbols = this.kpimEditorConfig.unitSymbols;
      // Split the input string by underscores
      const words = input.toLowerCase().split("_");
      // Capitalize the first letter of each word and join them with spaces
      const formattedString = words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Get the symbol for the input
      const symbol = unitSymbols[input.toUpperCase()];

      return { name: formattedString, symbol: symbol };
    },
  },
};
