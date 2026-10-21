<template>
  <v-card class="mx-auto" border flat :height="cardHeight">
    <v-card-text>
      <v-row>
        <v-col cols="3" id="previewChartsList">
          <chart-slider-component
            :chartTypes="chartTypes"
            :sliderHeight="cardHeight"
            @selectedChart="selectChart"
          />
        </v-col>
        <v-col cols="9" id="selectedChartSpace">
          <chart-component
            :type="selectedChart.type"
            :data="selectedChart.data"
            :labels="selectedChart.labels"
            :target-value="sessionItem.definition.targetValue"
            :cardHeight="cardHeight"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import ChartComponent from "./ChartComponent.vue";
import ChartSliderComponent from "@/components/ChartSliderComponent.vue";
const props = defineProps({
  sessionItem: Object,
  containerHeight: String,
});
const emit = defineEmits(["update-chart-type"]);
const cardHeight = computed(() => {
  return "calc(" + props.containerHeight + " - 52px - 32px)";
});

const chartData = ref([
  90, 70, 30, 40, 60, 70, 80, 100, 120, 140, 160, 200, 180, 190, 200, 210, 220, 230, 240,
]);

const chartLabels = ref([
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
]);

const chartTypes = [
  {
    type: "bar",
    data: [
      {
        label: "KPI values",
        backgroundColor: "#303F9F",
        borderColor: "#303F9F",
        data: chartData.value,
      },
    ],
    labels: chartLabels.value,
  },
  {
    type: "area",
    data: [
      {
        label: "KPI values",
        backgroundColor: "#303F9F",
        borderColor: "#303F9F",
        fill: true,
        data: chartData.value,
      },
    ],
    labels: chartLabels.value,
  },
  {
    type: "line",
    data: [
      {
        label: "KPI values",
        backgroundColor: "#303F9F",
        borderColor: "#303F9F",
        fill: false,
        data: chartData.value,
      },
    ],
    labels: chartLabels.value,
  },
  {
    type: "doughnut",
    data: [
      {
        label: "KPI values",
        backgroundColor: [
          "#ff6384",
          "#041f32",
          "#0033ff",
          "#4bc0c0",
          "#5600ff",
          "#ff0000",
          "#9f0023",
          "#36a2eb",
          "#ffcd56",
          "#e6ff00",
          "#9966ff",
          "#0a7033",
        ],
        data: [30, 20, 10, 40, 50, 60, 70, 80, 90, 100, 110, 120],
      },
    ],
    labels: chartLabels.value,
  },
];
const selectedChart = ref("");

function selectChart(chart) {
  selectedChart.value = chart;
  emit("update-chart-type", chart);
}

onMounted(() => {
  if (props.sessionItem.dashboard.chart.type !== "") {
    selectedChart.value = chartTypes.find(
      (chart) => chart.type === props.sessionItem.dashboard.chart.type
    );
  } else {
    selectedChart.value = chartTypes[0];
  }
});
</script>

<style scoped></style>
