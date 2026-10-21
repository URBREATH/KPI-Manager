export default {
  created() {
    this.opts = {
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
        if (this.$root.$i18n) {
          this.$root.$i18n.locale = value;
        }
        if (this.$vuetify.locale) {
          this.$vuetify.locale.current = value;
        }
      } else {
        if (this.$root.$i18n) {
          this.$root.$i18n.locale = "en";
        }
        if (this.$vuetify.locale) {
          this.$vuetify.locale.current = "en";
        }
      }
    },
  },
};
