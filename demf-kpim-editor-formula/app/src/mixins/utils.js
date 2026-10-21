export default {
  created() {
    this.opts = {
      headers: {},
      withCredentials: true,
    };
  },
  mounted() {
    this.setLocale(localStorage.getItem("lang") ? localStorage.getItem("lang") : false);
  },
  methods: {
    setLocale(value) {
      if (value) {
        this.$root.$i18n.locale = value;
        this.$vuetify.locale.current = value;
      } else {
        this.$root.$i18n.locale = "en";
        this.$vuetify.locale.current = "en";
      }
    },
    setExpiredSession() {
      document.dispatchEvent(
        new CustomEvent("session-expired", {
          detail: {
            storage: true,
          },
        })
      );
    },

    schedulePositiveNumber(value) {
      if (typeof value !== "string") {
        value = value.toString();
      }

      // Replace invalid characters with an empty string
      value = value.replace(/[^0-9]/g, "");

      // Ensure the value is not empty and is a positive integer
      if (value === "" || parseInt(value, 10) <= 0) {
        value = "0";
      }

      // Convert the final value to a number
      this.sessionItem.formula.job.schedule.value = parseInt(value, 10);
    },
    checkBalancedDelimiters(input) {
      // Regular expressions to match \left(, \right), \left[, \right], \left\{, and \right\}
      const leftParenPattern = /\\left\(/g;
      const rightParenPattern = /\\right\)/g;
      const leftSquarePattern = /\\left\[/g;
      const rightSquarePattern = /\\right\]/g;
      const leftCurlyPattern = /\\left\{/g;
      const rightCurlyPattern = /\\right\}/g;

      // Count the occurrences of each delimiter
      const leftParenCount = (input.match(leftParenPattern) || []).length;
      const rightParenCount = (input.match(rightParenPattern) || []).length;
      const leftSquareCount = (input.match(leftSquarePattern) || []).length;
      const rightSquareCount = (input.match(rightSquarePattern) || []).length;
      const leftCurlyCount = (input.match(leftCurlyPattern) || []).length;
      const rightCurlyCount = (input.match(rightCurlyPattern) || []).length;

      // Check if the counts of each type of delimiter are equal
      const parensBalanced = leftParenCount === rightParenCount;
      const squaresBalanced = leftSquareCount === rightSquareCount;
      const curliesBalanced = leftCurlyCount === rightCurlyCount;

      // Return true if all are balanced, false otherwise
      return parensBalanced && squaresBalanced && curliesBalanced;
    },
  },
};
