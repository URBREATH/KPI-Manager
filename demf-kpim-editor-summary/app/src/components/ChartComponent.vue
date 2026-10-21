<template>
  <div class="d-flex justify-center flex-column align-center">
    <div v-if="mockupAlert.value">
      <v-alert
        class="my-2 text-center"
        type="info"
        variant="tonal"
        border="start"
      >
        {{ $t("strings.mockup-alert") }}
      </v-alert>
    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { Chart as ChartJS, registerables } from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(...registerables, annotationPlugin);

export default {
  props: {
    data: Object,
    type: {
      type: String,
      default: "bar",
    },
    targetValue: Number,
    mockupAlert: Object,
  },
  setup(props) {
    const canvas = ref(null);
    const mockupAlert = ref(false);
    let chartInstance = null;
    const chartOptions = {
      plugins: {
        legend: {
          position: "top",
        },

        //annotation for the line that marks the target value
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
      maintainAspectRatio: true,
      responsive: true,
      aspectRatio: 4,
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
    const initializeChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
      chartInstance = new ChartJS(canvas.value, {
        type: props.type === "area" ? "line" : props.type,
        data: props.data,
        options:
          props.type !== "doughnut"
            ? {
                ...chartOptions,
                fill: props.type === "area",
                backgroundColor: "#303F9F",
                borderColor: "#303F9F",
              }
            : {
                ...chartOptions,
                fill: props.type === "area",
              },
      });
    };

    onMounted(() => {
      initializeChart();
      mockupAlert.value = props.mockupAlert;
    });

    watch(
      () => props.data,
      () => {
        if (chartInstance) {
          chartInstance.data = props.data;
          chartInstance.update();
        }
      },
    );

    watch(
      () => props.type,
      () => {
        initializeChart();
      },
    );

    return {
      canvas,
    };
  },
};
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 300px; /* You can adjust this value if needed */
}
</style>
