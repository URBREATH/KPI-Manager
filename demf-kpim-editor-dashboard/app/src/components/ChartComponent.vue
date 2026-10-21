<template>
  <p class="text-h6 mx-2 my-3">
    {{ $t("strings.dashboard-suggestion") }}
  </p>
  <v-card
    class="pa-2 mx-auto w-100 d-flex justify-center"
    :height="chartHeight * 0.33"
    :max-height="chartHeight"
  >
    <canvas ref="chartRef"></canvas>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

Chart.register(...registerables, annotationPlugin);

const props = defineProps({
  type: String,
  data: Array,
  labels: Array,
  size: Object,
  targetValue: Number,
  cardHeight: String,
});

const chartHeight = computed(() => {
  //Container - title - PaddingTop&Bottom
  return "calc(" + props.cardHeight + " - 56px - 32px)";
});

const chartRef = ref(null);
let chartInstance = null;

onMounted(() => {
  renderChart();
});

watch(
  () => props.type,
  () => {
    if (chartInstance) {
      chartInstance.destroy();
    }
    renderChart();
  }
);

function renderChart() {
  const data = {
    labels: props.labels,
    datasets: props.data,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: props.type !== "doughnut",
    plugins: {
      legend: {
        position: props.type !== "doughnut" ? "top" : "right",
      },
      annotation: {
        annotations:
          props.type !== "doughnut"
            ? {
                line1: {
                  type: "line",
                  yMin: props.targetValue,
                  yMax: props.targetValue,
                  borderColor: "#4CAF50",
                  borderWidth: 2,
                  label: {
                    content: `Target: ${props.targetValue}`,
                    enabled: true,
                    position: "end",
                  },
                },
              }
            : {},
      },
    },
    scales:
      props.type === "bar"
        ? {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            },
          }
        : {},
  };

  chartInstance = new Chart(chartRef.value, {
    type: props.type === "area" ? "line" : props.type,
    data,
    options: chartOptions,
  });
}
</script>
