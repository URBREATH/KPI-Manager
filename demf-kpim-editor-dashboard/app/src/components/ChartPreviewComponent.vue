<template>
  <v-card
    class="chart-preview-container pa-1"
    :elevation="0"
    :flat="true"
    :ripple="false"
    height="100%"
  >
    <canvas id="chart" ref="chartRef" class="chart-preview-canvas"></canvas>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const props = defineProps({
  type: String,
  data: Array,
  labels: Array,
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
  },
);

function renderChart() {
  const data = {
    labels: props.labels,
    datasets: props.data,
  };

  chartInstance = new Chart(chartRef.value, {
    type: props.type === "area" ? "line" : props.type,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false,
        },
      },
      interaction: {
        mode: "none",
      },
    },
  });
}
</script>
