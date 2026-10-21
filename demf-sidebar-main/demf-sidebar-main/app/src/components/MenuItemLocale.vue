<template>
  <div class="app-bar-menu-locale">
    <v-menu location="right" min-width="400">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props">
          <template v-slot:prepend>
            <v-icon>mdi-translate</v-icon>
          </template>

          <v-list-item-title
            >{{ $t("labels.language") }}
            <span class="text-uppercase">
              ({{ $vuetify.locale.current }})
            </span>
          </v-list-item-title>
          <template v-slot:append>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </template>
      <v-list :v-model:selected="currentLocaleValue">
        <v-list-item
          v-for="item in langs"
          :key="item"
          :value="item"
          v-on:click="changeLocale(item)"
          :title="$t('languages.' + item)"
        >
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import utils from "@/mixins/utils.js";

export default {
  name: "MenuItemLocale",
  mixins: [utils],
  data() {
    return {
      langs: this.loadLocaleLanguages(),
      currentLocale: "",
    };
  },
  computed: {
    currentLocaleValue() {
      return this.langs.indexOf(this.currentLocale);
    },
  },
  methods: {
    changeLocale(value) {
      this.setLocale(value);
    },
    loadLocaleLanguages() {
      const locales = require.context(
        "@/locales",
        true,
        /[A-Za-z0-9-_,\s]+\.json$/i,
      );
      const languages = [];
      locales.keys().forEach((key) => {
        const matched = key.match(/([A-Za-z0-9-_]+)\./i);
        if (matched && matched.length > 1) {
          const locale = matched[1];
          languages.push(locale);
        }
      });
      return languages;
    },
  },
};
</script>
