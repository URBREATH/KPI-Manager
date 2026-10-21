<template>
  <v-app id="eventHandlerApp">
    <v-container :fluid="true" class="d-flex justify-center" width="100%">
      <Alert
        :color="errorColor"
        :activated="activation"
        :statusText="statusText"
        :statusMessage="statusMessage"
        :statusCode="statusCode"
        :actionFunction="actionEvent"
        @closeAlert="activation = $event"
      />
    </v-container>
  </v-app>
</template>

<script>
import pkg from "../package.json";
import utils from "@/mixins/utils.js";
import EventsDefinitionsMixin from "@/mixins/EventsDefinitions.js";
import Alert from "@/components/Alert.vue";
export default {
  name: "EventHandlerApp",
  mixins: [utils, EventsDefinitionsMixin],
  components: { Alert },
  props: ["eventHandlerConfig", "realm"],
  data: function () {
    return {
      appVersion: pkg.version,
      activation: false,
      errorColor: "warning",
      statusText: "",
      statusMessage: "",
      statusCode: "",
      loginUser: false,
    };
  },
  mounted() {
    console.log("Mounted demf-event-handler v", this.appVersion);
    document.addEventListener("language-localstorage-changed", (event) => {
      this.setLocale(event.detail.storage);
    });
  },
};
</script>
