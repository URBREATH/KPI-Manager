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
    setError(err, prevent, actionEv) {
      if (!err || err.response.status >= 500) {
        err = {
          response: {
            status: "500",
            statusText: "server_error",
          },
        };
      }
      document.dispatchEvent(
        new CustomEvent("error-" + err.response.status, {
          detail: {
            preventDefault: prevent | false,
            callbackEvent: actionEv,
            data: err.response,
          },
        })
      );
    },
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
  },
};
