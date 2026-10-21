<template>
  <v-snackbar
    content-class="snackbarContent"
    v-model="alertTrigger"
    :timeout="timeout"
    vertical
    multi-line
    app
    :color="color"
    class="pa-0"
  >
    <template v-if="messageText">
      <v-card
        class="mx-auto pa-0 my-n4 mx-n4"
        min-width="350"
        variant="flat"
        :color="color"
        prepend-icon="mdi-alert"
        :title="$t('errors.request.' + this.messageText)"
        density="comfortable"
      >
        <template v-slot:prepend>
          <v-avatar color="white" variant="outlined" size="large">
            <v-icon size="x-large" icon="mdi-alert"></v-icon>
          </v-avatar>
        </template>
        <template v-slot:append>
          <v-btn
            density="compact"
            icon
            variant="plain"
            @click="setTrigger(false)"
          >
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </template>
        <v-card-text v-if="translatedMessage" class="text-body-1 mt-2">
          {{ translatedMessage }}
        </v-card-text>
        <v-card-text v-if="statusMessage" class="text-body-2 mt-2">
          [ {{ statusMessage }} ]
        </v-card-text>
      </v-card>
      <v-divider
        v-if="statusCode === '401'"
        class="my-2 white"
        style="opacity: 0.22"
      ></v-divider>
    </template>
    <template v-if="statusCode === '401'" v-slot:actions>
      <v-divider class="my-2 white" style="opacity: 0.22"></v-divider>
      <v-btn variant="text" @click="loginUser()">
        {{ $t("errors.request." + this.messageText + "_msg2") }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  props: {
    activated: Boolean,
    color: String,
    statusText: String,
    statusCode: String,
    statusMessage: String,
    actionFunction: Function,
  },
  data() {
    return {
      timeout: 10000,
    };
  },
  computed: {
    alertTrigger: {
      get() {
        return this.activated;
      },
      set(value) {
        this.$emit("closeAlert", value);
      },
    },
    messageText() {
      return this.statusText.toLowerCase().replace(/\s+/g, "_");
    },
    translatedMessage() {
      const translationKey = "errors.request." + this.messageText + "_msg";
      const translation = this.$t(translationKey);
      return translation !== translationKey ? translation : null;
    },
  },
  methods: {
    setTrigger(value) {
      this.alertTrigger = value;
    },
    loginUser() {
      this.actionFunction("error-login-callback");
    },
  },
};
</script>
