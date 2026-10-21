export default {
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
  },
};
