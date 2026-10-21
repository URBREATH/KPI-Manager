export default {
  created() {
    this.opts = {
      headers: {},
      withCredentials: true,
    };
  },
  mounted() {
    this.setLocale(
      localStorage.getItem("lang") ? localStorage.getItem("lang") : false,
    );
  },
  methods: {
    setLocale(value) {
      if (value) {
        this.$i18n.locale = value;
        this.$vuetify.locale.current = value;
      } else {
        this.$i18n.locale = "en";
        this.$vuetify.locale.current = "en";
      }
    },
    setExpiredSession() {
      document.dispatchEvent(
        new CustomEvent("session-expired", {
          detail: {
            storage: true,
          },
        }),
      );
    },
  },
};
