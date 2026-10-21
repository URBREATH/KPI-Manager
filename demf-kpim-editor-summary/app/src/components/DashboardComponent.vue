<template>
  <v-card class="mx-auto d-flex flex-column" flat height="100%" width="100%">
    <v-card-text class="ml-1 px-0">
      <!-- Status switch -->
      <v-row no-gutters>
        <v-col v-if="kpi?.id" cols="12" class="text-center d-flex align-center justify-center">
          <v-switch
            v-model="kpiStatus"
            false-value="PENDING"
            true-value="RUNNING"
            hide-details
            color="secondary"
          >
            <template v-slot:label>
              <div class="text-overline">
                {{ `${$t("labels.status").toUpperCase()}: ` }}
              </div>
              <div class="font-weight-medium text-capitalize">
                {{ statusStyle.text }}
              </div>
              <v-icon class="ml-2" :color="statusStyle.color">
                {{ statusStyle.icon }}
              </v-icon>
            </template>
          </v-switch>
          <v-tooltip bottom v-if="jobStatus !== kpiStatus">
            <template v-slot:activator="{ props }">
              <span
                v-bind="props"
                class="text-red text-h5 font-weight-bold ma-0 pa-0"
                style="cursor: pointer"
              >
                *</span
              >
            </template>
            <span>{{ $t("strings.status-changed") }}</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <v-divider class="my-4"></v-divider>
      <!-- Status switch -->
      <v-row class="align-center">
        <v-col cols="8">
          <h3>{{ $t("labels.description") }}</h3>
          <p>{{ sessionKpi.description }}</p>
        </v-col>
        <v-col cols="4" class="text-right">
          <h3 class="d-inline-block mr-3 text-capitalize">
            {{ $t("labels.unit-measure") }}
          </h3>
          <!-- <span>{{ sessionKpi.definition?.targetValue }}</span> -->
          <p class="text-capitalize mx-2">
            {{ sessionKpi.definition?.unitMeasure }}
          </p>
        </v-col>
      </v-row>
      <v-divider class="my-4"></v-divider>
      <!-- Value Badges -->
      <v-row class="ma-2">
        <v-col>
          <v-card class="text-green text-center">
            <template v-slot:prepend>
              <v-avatar color="green" size="48">
                <v-icon size="x-large" icon="mdi-target"></v-icon>
              </v-avatar>
            </template>
            <template v-slot:title>
              <span class="text-body-1 font-weight-medium">
                {{ $t("labels.target-value") }}
              </span>
            </template>
            <template v-slot:subtitle>
              <span class="font-weight-bold">
                {{ sessionKpi.definition?.targetValue || 0 }}
              </span>
            </template>
          </v-card>
        </v-col>
        <v-col>
          <v-card class="text-deep-orange text-center">
            <template v-slot:prepend>
              <v-avatar color="deep-orange" size="48">
                <v-icon size="x-large" icon="mdi-trending-down"></v-icon>
              </v-avatar>
            </template>
            <template v-slot:title>
              <span class="text-body-1 font-weight-medium">
                {{ $t("labels.minimum") }}
              </span>
            </template>
            <template v-slot:subtitle>
              <span class="font-weight-bold">
                {{ minimumValue }}
              </span>
            </template>
          </v-card>
        </v-col>
        <v-col>
          <v-card class="text-blue text-center">
            <template v-slot:prepend>
              <v-avatar color="blue" size="48">
                <v-icon size="x-large" icon="mdi-trending-up"></v-icon>
              </v-avatar>
            </template>
            <template v-slot:title>
              <span class="text-body-1 font-weight-medium">
                {{ $t("labels.maximum") }}
              </span>
            </template>
            <template v-slot:subtitle>
              <span class="font-weight-bold">
                {{ maximumValue }}
              </span>
            </template>
          </v-card>
        </v-col>
        <v-col>
          <v-card class="text-purple text-center">
            <template v-slot:prepend>
              <v-avatar color="purple" size="48">
                <v-icon size="x-large" icon="mdi-swap-horizontal"></v-icon>
              </v-avatar>
            </template>
            <template v-slot:title>
              <span class="text-body-1 font-weight-medium">
                {{ $t("labels.average") }}
              </span>
            </template>
            <template v-slot:subtitle>
              <span class="font-weight-bold">
                {{ averageValue }}
              </span>
            </template>
          </v-card>
        </v-col>
      </v-row>
      <!-- KPI Chart -->
      <v-row class="py-2 d-flex justify-center">
        <v-col cols="11">
          <Chart
            :data="chartData"
            :type="chartType"
            :target-value="sessionKpi.definition.targetValue"
            :mockupAlert="mockupAlert"
          />
        </v-col>
      </v-row>
      <!-- Formula & Geolocation -->
      <v-row class="mt-4">
        <!-- formula -->
        <v-col :cols="locationSelected ? 8 : 12">
          <v-card class="h-100" variant="outlined" color="primary">
            <v-card-title> {{ $t("labels.kpi-formula") }}</v-card-title>
            <v-card-text>
              <MathField :expression="formula" />
              <p v-if="!isFormulaValid" class="text-caption mt-2">
                <span class="bg-secondary pa-1 rounded">
                  {{ $t("strings.no-measure-formula") }}
                </span>
              </p>
            </v-card-text>
            <v-card-text>
              <span class="text-overline">{{ $t("labels.schedule") }}</span>
              <span class="font-weight-medium"
                >{{ sessionKpi.formula?.job?.schedule?.value || "" }}
                {{
                  sessionKpi.formula?.job?.schedule?.time
                    ? $t(`labels.${sessionKpi.formula?.job?.schedule?.time}`)
                    : ""
                }}</span
              >
            </v-card-text>
          </v-card>
        </v-col>
        <!-- geolocation -->
        <v-col :cols="locationSelected ? 4 : 0" v-if="locationSelected">
          <v-card class="h-100" flat>
            <l-map
              :zoom="zoom"
              :center="center"
              style="height: 100%; width: 100%"
              :options="mapOptions"
            >
              <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              />
              <l-marker
                :lat-lng="[
                  sessionKpi?.definition?.geolocation?.latitude,
                  sessionKpi?.definition?.geolocation?.longitude,
                ]"
              />
            </l-map>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from "vue";
import Chart from "./ChartComponent.vue";
import { fetchChartData } from "../composables/fetchChartData";
import MathField from "@/components/MathField.vue";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "vue-i18n";

export default {
  components: {
    LMarker,
    LTileLayer,
    LMap,
    MathField,
    Chart,
  },
  props: {
    kpimEditorConfig: {
      type: Object,
      required: true,
    },
    realm: {
      type: String,
      required: true,
    },
    kpi: { type: Object },
    validFormula: { type: Boolean },
    storedKpiStatus: { type: String },
  },
  emits: ["writeCronJobStatus"],
  setup(props, { emit }) {
    const formula = ref("");
    const { t } = useI18n();
    const sessionKpi = reactive(props.kpi);
    const kpiStatus = ref(sessionKpi?.formula?.job?.status.toUpperCase());
    const chartData = ref({});
    const chartType = ref(sessionKpi?.dashboard?.chart.type);
    const zoom = ref(13);
    const minimumValue = ref(0);
    const maximumValue = ref(0);
    const averageValue = ref(0);
    const apiUrl = props.kpimEditorConfig.api;
    const realm = props.realm;
    const mockupAlert = reactive({ value: false });
    const isFormulaValid = ref(false);
    const jobStatus = ref(props.storedKpiStatus);

    const center = computed(() => {
      if (
        sessionKpi?.definition?.geolocation?.latitude !== "" &&
        sessionKpi?.definition?.geolocation?.longitude !== ""
      ) {
        return [
          sessionKpi?.definition?.geolocation?.latitude,
          sessionKpi?.definition?.geolocation?.longitude,
        ];
      } else {
        return [52, 0];
      }
    });

    zoom.value = center.value[0] === 52 && center.value[1] === 0 ? 3 : zoom.value;

    const mapOptions = {
      dragging: false,
      scrollWheelZoom: "center",
      doubleClickZoom: false,
    };

    onMounted(async () => {
      let obj = await fetchChartData(apiUrl, realm);
      formula.value = reverseValues(sessionKpi?.formula?.expression);
      chartData.value = obj.chartData || {};
      mockupAlert.value = obj.mockupAlert;
      minimumValue.value = formatNumber(obj.data.value.data.statistics.min);
      maximumValue.value = formatNumber(obj.data.value.data.statistics.max);
      averageValue.value = formatNumber(obj.data.value.data.statistics.avg);
      isFormulaValid.value = props.validFormula;
    });

    function formatNumber(num) {
      // Convert to a string with up to 6 digits after the decimal
      let str = num.toFixed(6);

      // Remove trailing zeros and the decimal point if there are no fractional digits
      str = str.replace(/\.?0+$/, "");

      return str;
    }
watch(kpiStatus, (newStatus) => {
  emit("writeCronJobStatus", newStatus);
});
    function toggleCronJob(switchValue) {
      emit("writeCronJobStatus", switchValue === "RUNNING" ? "PENDING" : "RUNNING");
    }

    const locationSelected = computed(() => {
      return (
        sessionKpi.definition.geolocation.latitude !== "" &&
        sessionKpi.definition.geolocation.longitude !== ""
      );
    });

    const statusStyle = computed(() => {
      let style = { value: false, text: "", color: "", icon: "" };
      if (sessionKpi.formula.job.status.toUpperCase() === "RUNNING") {
        style.value = true;
        style.text = t("labels.status-running");
        style.color = "green";
        style.icon = "mdi-play-circle-outline";
      } else {
        style.value = false;
        style.text = t("labels.status-stopped");
        style.color = "red";
        style.icon = "mdi-stop-circle-outline";
      }
      return style;
    });

    //reverse the formula to be displayed in the editor
    function reverseValues(formula) {
      const replacements = {
        "\\mu": "\\avg",
        Σ: "\\sum",
        "\\med": "\\median",
        Mo: "\\mode",
        "\\sigma": "\\stddev",

        // Add more replacements as needed
      };
      let resultString = formula;

      for (const [key, value] of Object.entries(replacements)) {
        resultString = resultString.split(value).join(key);
      }

      return resultString;
    }

    return {
      sessionKpi,
      kpiStatus,
      chartData,
      formula,
      statusStyle,
      chartType,
      t,
      zoom,
      center,
      mapOptions,
      reverseValues,
      minimumValue,
      maximumValue,
      averageValue,
      mockupAlert,
      isFormulaValid,
      locationSelected,
      toggleCronJob,
      jobStatus,
    };
  },
};
</script>

<style scoped></style>
