import { createVuetify } from "vuetify";

import "vuetify/dist/vuetify.css";

// Translation provided by Vuetify (javascript)
import it from "vuetify/lib/locale/it";
import es from "vuetify/lib/locale/es";
import cs from "vuetify/lib/locale/cs";
import da from "vuetify/lib/locale/da";
import de from "vuetify/lib/locale/de";
import el from "vuetify/lib/locale/el";
import en from "vuetify/lib/locale/en";
import fi from "vuetify/lib/locale/fi";
import fr from "vuetify/lib/locale/fr";
import nl from "vuetify/lib/locale/nl";
import ro from "vuetify/lib/locale/ro";

export default createVuetify({
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {},
    },
    lang: {
      locales: { it, es, cs, da, de, el, en, fi, fr, nl, ro},
      current: "en",
    },
  },
});
