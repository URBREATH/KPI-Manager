import L from "leaflet";
export default {
  data() {
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
    };
  },
  methods: {
    //initialize the map and applies all other layers e.g markers
    initMap() {
      let coordinates = {};

      this.map = L.map("map", {
        dragging: false,
        scrollWheelZoom: "center",
        doubleClickZoom: false,
      });

      this.markerLayer = new L.LayerGroup();
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.markerLayer.addTo(this.map);

      if (this.isNewKpi()) {
        this.map.setView([51.505, -0.09], 3);
      } else {
        coordinates = { ...this.sessionItem.definition.geolocation };
        this.setLatLng(coordinates);
        this.setMarker(coordinates);
      }
    },

    //helper function to check wether the user is creating a new kpi or editing an old one
    isNewKpi() {
      return (
        this.sessionItem.definition.geolocation.latitude == 0 ||
        this.sessionItem.definition.geolocation.longitude == 0
      );
    },

    //empty the map container
    clearMap() {
      this.map != undefined ? this.map.remove() : null;
    },

    //set the marker after localization
    setMarker(coordinates) {
      if (this.markerLayer.getLayers().length >= 1) {
        this.markerLayer.clearLayers();
      }
      this.marker = L.marker(
        {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        },
        {
          icon: this.icon,
        },
      ).addTo(this.markerLayer);
    },

    //extrapolate latitude and longitude from latlng object
    setLatLng(coordinates) {
      this.map.setView(
        L.latLng(coordinates.latitude, coordinates.longitude),
        16,
      );
    },

    //extrapolate latitude and longitude from latlng object
    setMapCentre(coordinates) {
      let zoom = this.map.getZoom() === undefined ? 16 : this.map.getZoom();
      this.map.setView(
        L.latLng(coordinates.latitude, coordinates.longitude),
        zoom,
      );
    },
  },
};
