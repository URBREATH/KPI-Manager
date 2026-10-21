import { createStore } from "vuex";

import loginModule from "@/store/modules/login.js";

export default createStore({
  modules: {
    loginModule,
  },
});
