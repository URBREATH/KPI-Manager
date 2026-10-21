<template>
  <v-app>
    <v-footer :app="true" color="primary" class="pa-0" permanent>
      <v-card
        width="30%"
        variant="flat"
        color="primary"
        class="text-left d-flex align-center"
        max-height="40"
      >
        <v-card-text class="white--text text-caption">&emsp;</v-card-text>
      </v-card>
      <v-card
        variant="flat"
        tile
        width="40%"
        color="primary"
        class="text-center"
        max-height="40"
      >
        <v-card-text
          class="white--text text-caption d-flex justify-center align-center pa-1"
        >
          <v-img
            max-width="38"
            :src="imgsPath + `/core-images_eng_logo_minimal_white.svg`"
          ></v-img>
          &emsp;
          {{ normalizedCopyright }}
        </v-card-text>
      </v-card>
      <v-card
        variant="flat"
        tile
        width="30%"
        color="primary"
        class="text-right d-inline-flex justify-end align-center"
        max-height="40"
      >
        <v-card-text class="white--text d-flex align-center">
          &emsp;
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
import utils from "@/mixins/utils.js";
import pkg from "../package.json";
export default {
  name: "Footer",
  mixins: [utils],
  props: ["realm", "footerConfig"],
  mounted() {
    console.log("Mounted demf-footer v", this.appVersion);
  },
  data: function () {
    return {
      appVersion: pkg.version,
      imgsPath: this.footerConfig.storageImgs,
    };
  },
  computed: {
    normalizedCopyright: function () {
      return " © " + new Date().getFullYear();
    },
  },
  watch: {},
};
</script>
