import { createVuetify } from "vuetify";

import "vuetify/dist/vuetify.css";

// Translation provided by Vuetify (javascript)
import it from "vuetify/lib/locale/it";
import es from "vuetify/lib/locale/es";

export default createVuetify({
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {},
    },
    lang: {
      locales: { it, es },
      current: "en",
    },
  },
});
