<template>
  <v-card
    variant="outlined"
    class="d-flex align center flex-row align-center ga-2 mb-2 pr-2 mr-2 flex-grow-1"
    :height="containerHeight"
  >
    <div class="flex-grow-1 h-100" :id="dynamicId"></div>
    <!-- Map creation dialog -->
    <v-dialog v-model="dialogMap" max-width="1000">
      <template v-slot:activator="{ props: activatorProps }">
        <v-sheet class="d-flex align-start flex-column py-4" height="100%">
          <v-btn
            :disabled="loading"
            icon
            v-bind="activatorProps"
            color="secondary"
            variant="flat"
            class="mb-auto tour-location-button"
            ><v-tooltip activator="parent" location="top"
              ><span>{{ $t("labels.select-location") }}</span></v-tooltip
            ><v-icon size="large">mdi-target</v-icon>
          </v-btn>

          <v-btn
            icon="mdi-delete"
            variant="text"
            :disabled="loading"
            color="secondary"
            @click="resetMap()"
            ><v-tooltip activator="parent" location="top"
              ><span>{{ $t("labels.reset-location") }}</span></v-tooltip
            ><v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-sheet>
      </template>
      <v-card>
        <v-toolbar color="secondary">
          <v-toolbar-title class="text-white">
            {{ $t("labels.select-location") }}
          </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-btn color="white" icon @click="this.dialogMap = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <CreationMap
          :kpimEditorConfig="kpimEditorConfig"
          @writeGeolocation="writeGeolocation"
          :parentGeolocation="this.sessionItem.definition.geolocation"
        ></CreationMap>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="primary darken-1" variant="text" @click="this.dialogMap = false">{{
            $t("labels.cancel")
          }}</v-btn>
          <v-btn color="secondary darken-1" variant="text" @click="closeLocationDialog">{{
            $t("labels.save")
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- END Map creation dialog -->
  </v-card>
</template>
<script>
import commonMethods from "../mixins/commonMethods";
import mapMethods from "../mixins/mapMethods";
import utils from "../mixins/utils";
import CreationMap from "./CreationMap.vue";

import L from "leaflet";

export default {
  name: "CreationMapContainer",
  props: [
    "kpimEditorConfig",
    "parentSessionItem",
    "parentDynamicId",
    "parentLoading",
    "parentHeight",
  ],
  mixins: [mapMethods, commonMethods, utils],
  emits: ["writeGeolocation"],
  components: {
    CreationMap,
  },
  data() {
    return {
      dialogMap: false,
      sessionItem: {
        definition: {
          geolocation: {
            latitude: "",
            longitude: "",
          },
          selected: [],
        },
      },
      dynamicId: "map",
      loading: true,
      map: L.Map,
      marker: L.Marker,
      markerLayer: L.LayerGroup,
    };
  },
  mounted() {
    this.updateContainerHeight(); // Update dimensions
    window.addEventListener("resize", this.updateContainerHeight);
    this.$nextTick(() => {
      this.sessionItem = this.parentSessionItem;
      this.loading = this.parentLoading;
      this.initMap();
    });
  },

  methods: {
    writeGeolocation(geolocation) {
      this.$emit("writeGeolocation", geolocation);
    },
    resetMap() {
      this.$emit("writeGeolocation", { latitude: "", longitude: "" });
      this.markerLayer.clearLayers();
      this.map.setView([51.505, -0.09], 3);
    },
  },
  watch: {
    dialogMap(value) {
      value === true ? (this.dynamicId = "wait") : (this.dynamicId = "map");
    },
    parentLoading(value) {
      this.loading = value;
    },
    parentHeight(value) {
      this.containerHeight = value;
    },
  },
};
</script>
<style>
#map {
  width: 50%;
  height: 200px;
}
#wait {
  width: 50%;
  height: 250px;
  border: solid 1px;
}
</style>
