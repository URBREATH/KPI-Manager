import axios from "axios";
import L from "leaflet";
export default {
  data() {
    return {
      apiUrl: this.kpimEditorConfig.api,
      leftScrollHeight: "100%",
      rightScrollHeight: "100%",
      containerHeight: "100%",
    };
  },
  methods: {
    async getKPIsList() {
      try {
        this.loading = true;
        const response = await axios.get(`${this.apiUrl}/${this.realm}/kpi`, {
          withCredentials: true,
        });
        this.KPIs = response.data.data;
      } catch (err) {
        this.setError(err, false);
      }
    },

    async getMeasures() {
      try {
        const response = await axios.get(`${this.apiUrl}/${this.realm}/measures`, {
          withCredentials: true,
        });
        this.measures = response.data.data.map((item) => ({
          id: item.id,
          type: "measure",
          name: item.name,
        }));
      } catch (err) {
        this.setError(err, false);
      }
    },

    //called when a KPI is partially or already created - dispatch previously selected measures or KPIs to the right array
    dispatchSelected() {
      this.sessionItem.definition.selected.forEach((item) => {
        this.measures.forEach((measure) => {
          if (item.name === measure.name) {
            this.selected.push(measure);
          }
        });
        this.KPIs.forEach((kpi) => {
          if (item.name === kpi.name) {
            this.selected.push(kpi);
          }
        });
      });

      //this goes to 0 as it will get filled again when clicking continue, taking objects from this.selected
      this.sessionItem.definition.selected.length = 0;
    },

    //actions happening when closing the localization dialog
    closeLocationDialog() {
      const coordinates = this.sessionItem.definition.geolocation;
      this.dialogMap = false; //close the dialog
      this.setLatLng(coordinates);
      this.setMarker(coordinates);
    },

    //move to next page
    next() {
      this.selected.forEach((item) =>
        this.sessionItem.definition.selected.push({
          id: item.id,
          name: item.name,
          type: item.type === "measure" ? "measure" : "kpi",
        })
      );
      this.search = "";
      this.selected = [];
      this.routeToFormula();
      this.sessionItem.definition.selected = [];
    },

    //this function regulates the height of the elements in the lower part of the screen
    updateContainerHeight() {
      const element = document.getElementById("main-container-definition");
      if (element) {
        const elementCss = window.getComputedStyle(element);
        this.containerHeight = parseFloat(elementCss.height);

        // Constants derived from calculations
        const k = 400;
        const c = 0.06;
        const x = this.containerHeight;

        // Calculate y based on the inverse linear equation
        let y = k / x + c;

        // Ensure y is between 0 and 1
        y = Math.max(0, Math.min(y, 1));

        // Calculate dynamicHeight
        const dynamicHeight = (this.containerHeight * y) / 1000;

        // Update heights
        this.leftScrollHeight = `${this.containerHeight * dynamicHeight - 105}px`;
        this.rightScrollHeight = `${this.containerHeight * dynamicHeight - 50}px`;
        this.containerHeight = `calc(${this.containerHeight}px * ${dynamicHeight})`;
      } else {
        console.warn("Element not found:", element);
      }
    },

    //redirect to Kpis list
    routeToHome() {
      this.$router.push({
        path: "/kpis",
      });
    },

    //Continue kpi definition in Formula (change page)
    routeToFormula() {
      sessionStorage.setItem("kpi", JSON.stringify(this.sessionItem));
      this.setEditableStep("geolocation", 1);
      this.$router.push({
        path: "/editor/formula",
      });
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
        }
      ).addTo(this.markerLayer);
    },
  },
};
