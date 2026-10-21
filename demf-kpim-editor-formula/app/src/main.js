import { h, createApp } from "vue";
import singleSpaVue from "single-spa-vue";

import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import i18n from "./i18n";
import store from "./store";

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(App, {
        // single-spa props are available on the "this" object. Forward them to your component as needed.
        // https://single-spa.js.org/docs/building-applications#lifecycle-props
        // if you uncomment these, remember to add matching prop definitions for them in your App.vue file.
        kpimEditorConfig: this.kpimEditorConfig,
        palette: this.palette,
        realm: this.realm,
      });
    },
  },
  handleInstance(app, props) {
    app.use(router);
    app.use(i18n);

    const palette = props.palette;
    vuetify.theme.computedThemes.value.light.colors.primary = palette.primary;
    vuetify.theme.computedThemes.value.light.colors.secondary =
      palette.secondary;
    vuetify.theme.computedThemes.value.light.colors.accent = palette.accent;
    vuetify.theme.computedThemes.value.light.colors.error = palette.error;
    vuetify.theme.computedThemes.value.light.colors.info = palette.info;
    vuetify.theme.computedThemes.value.light.colors.success = palette.success;
    vuetify.theme.computedThemes.value.light.colors.warning = palette.warning;

    app.use(vuetify);
    app.use(store);
  },
});

export const bootstrap = vueLifecycles.bootstrap;
export const mount = vueLifecycles.mount;
export const unmount = vueLifecycles.unmount;
