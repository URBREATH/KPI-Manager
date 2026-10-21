<template>
  <v-card :flat="true" class="d-flex flex-column ga-2 ma-3 pa-3">
    <div>{{ $t("strings.select-location") }}</div>
    <div id="blank" class="mb-2"></div>
    <v-text-field
      name="latitude"
      v-model="geolocation.latitude"
      :label="$t('labels.latitude')"
      variant="outlined"
      density="compact"
      :update:modelValue="this.numberValue(geolocation.latitude, 'latitude')"
      :hint="$t('strings.number-hint')"
      maxlength="15"
    ></v-text-field>
    <v-text-field
      name="longitude"
      v-model="geolocation.longitude"
      :label="$t('labels.longitude')"
      variant="outlined"
      density="compact"
      :update:modelValue="this.numberValue(geolocation.longitude, 'longitude')"
      :hint="$t('strings.number-hint')"
      maxlength="15"
    ></v-text-field>
  </v-card>
</template>
<script>
import L from "leaflet";
import commonMethods from "../mixins/commonMethods";
import mapMethods from "../mixins/mapMethods";
import utils from "../mixins/utils";
export default {
  mixins: [commonMethods, mapMethods, utils],
  props: ["kpimEditorConfig", "parentGeolocation"],
  emits: ["writeGeolocation"],
  data: function () {
    return {
      icon: L.icon({
        iconUrl:
          "https://upload.wikimedia.org/wikipedia/commons/8/88/Map_marker.svg",
        iconSize: [35, 41],
        iconAnchor: [10, 41],
        popupAnchor: [2, -40],
        shadowUrl:
          "https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png",
      }),
      map: L.Map,
      marker: L.Marker,
      markerLayer: L.LayerGroup,
      geolocation: {
        latitude: "",
        longitude: "",
      },
    };
  },

  mounted() {
    this.initMap();
  },

  methods: {
    initMap() {
      if (document.getElementById("blank")) {
        document.getElementById("blank").setAttribute("id", "map");
      }
      this.map = L.map("map");
      this.markerLayer = new L.LayerGroup();
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
      this.map.on("click", this.onMapClick);
      this.markerLayer.addTo(this.map);

      if (this.markerAlreadySet()) {
        this.geolocation = this.parentGeolocation;
        this.setMapCentre(this.geolocation);
        this.setMarker(this.geolocation);
      } else {
        this.map.setView([51.505, -0.09], 3);
      }
    },

    //put marker on the map on click, removing the previous one if it exists
    onMapClick(e) {
      //check if markers > 1
      if (this.markerLayer.getLayers().length >= 1) {
        //delete previous markers
        this.markerLayer.clearLayers();
        this.getLatLng(e);
      } else {
        this.getLatLng(e);
      }
    },

    //this function creates the marker layer (an object) and sets the geolocation object in session storage
    getLatLng(e) {
      this.marker = L.marker(e.latlng, {
        icon: this.icon,
      }).addTo(this.markerLayer);

      //send e values to be checked for invalid inputs
      this.geolocation.latitude = e.latlng.lat;
      this.geolocation.longitude = e.latlng.lng;

      this.$emit("writeGeolocation", this.geolocation);
      this.setMapCentre(this.geolocation);
    },

    //check user's inputs for lat and lng and removes anything that makes it NaN
    numberValue(value, type) {
      if (typeof value !== "string") {
        value = value.toString();
      }
      // Replace invalid characters with an empty string
      value = value.replace(/[^0-9,.-]/g, "");
      // Replace all '.' with ','
      value = value.replace(/,/g, ".");
      // Ensure the dot is not at the beginning
      if (value.startsWith(".")) {
        value = value.substring(1);
      }
      // Ensure the dot is not immediately after a minus sign
      value = value.replace(/-\./, "-");
      // Ensure '-' only appears at the start
      value = value.replace(/(?!^)-/g, "");
      // Split the value by commas to check positions of hyphens
      let parts = value.split(".");
      // Keep only the first comma
      if (parts.length > 2) {
        parts = [parts.slice(0, 2).join(".")];
      }
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].indexOf("-") > 0) {
          // If hyphen is not at the start, remove it
          parts[i] = parts[i].replace("-", "");
        }
      }
      // Join the parts back together with commas
      value = parts.join(".");

      if (type === "latitude") {
        this.geolocation.latitude = value;
      }
      if (type === "longitude") {
        this.geolocation.longitude = value;
      }

      if (!Object.values(this.geolocation).includes("")) {
        this.$emit("writeGeolocation", {
          latitude: this.checkIntegrity(this.geolocation.latitude),
          longitude: this.checkIntegrity(this.geolocation.longitude),
        });
      }
    },

    checkIntegrity(value) {
      switch (value) {
        case "":
          return "";
        case "-":
          return "";
        case ".":
          return "";
        default:
          return parseFloat(value);
      }
    },

    markerAlreadySet() {
      return (
        this.parentGeolocation.latitude !== "" &&
        this.parentGeolocation.longitude !== ""
      );
    },
  },
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 50vh;
}
</style>
