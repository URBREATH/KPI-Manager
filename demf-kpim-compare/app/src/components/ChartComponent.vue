<template>
  <v-container id="chart-container" class="pa-0">
    <v-row>
      <v-col cols="12">
        <v-card :height="cardHeight">
          <v-card-text class="pa-0 pr-2 h-100 position-relative">
            <v-alert
              v-model="noDataAlert"
              class="position-absolute top-0 left-0 mt-16 ms-12"
              type="warning"
              closable
            >
              {{ $t("strings.no-data") }}
            </v-alert>
            <v-alert
              v-model="noDataMatch"
              class="position-absolute top-0 left-0 mt-16 ms-12"
              type="info"
              closable
            >
              {{ $t("strings.no-match") }}
            </v-alert>
            <div v-if="overlay" class="bg-white w-100 h-100 opacity-40 position-absolute"></div>
            <canvas ref="canvas"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { ref, onMounted, watch, computed } from "vue";
import { Chart as ChartJS, registerables } from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(...registerables, annotationPlugin);

export default {
  props: {
    data: Object,
    targetValue: Number,
    mockupAlert: Object,
    containerHeight: String,
    graphSetting: String,
    updateInput: Boolean,
    loading: Boolean,
  },
  setup(props) {
    const canvas = ref(null);
    const mockupAlert = ref(false);
    let chartInstance = null;
    let type = ref("line");
    let noDataAlert = ref(false);
    let noDataMatch = ref(false);

    const changeGraph = (val) => {
      if (val === "line" || val === "bar") {
        type.value = val;
      }
      initializeChart();
    };

    const cardHeight = computed(() => {
      return "calc(" + props.containerHeight + " - 190px)";
    });

    const initializeChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
      chartInstance = new ChartJS(canvas.value, {
        type: type.value,
        data: props.data,
        options: {
          maintainAspectRatio: false,
          backgroundColor: "#303F9F",
          borderColor: "#303F9F",
          responsive: true,
          spanGaps: true,
          plugins: {
            tooltip: {
              mode: "index",
            },
          },
          interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false,
          },
          scales: {
            x: {
              title: {
                display: true,
              },
            },
            y: {
              title: {
                display: true,
                text: "Value",
              },
            },
          },
          datasets: {
            bar: {
              skipNull: true,
            },
          },
        },
      });
    };

    onMounted(() => {
      initializeChart();
      mockupAlert.value = props.mockupAlert;
    });

    const overlay = computed(() => {
      return props.loading;
    });

    watch(
      () => props.updateInput,
      async (val) => {
        if (val) {
          if (chartInstance) {
            chartInstance.data = props.data;

            //alert if no data
            chartInstance.scales.x.afterBuildTicks = function () {
              if (this.ticks.length === 0) {
                noDataAlert.value = true;
              } else {
                noDataAlert.value = false;
              }
            };

            //alert if no data match
            let dataEntries = 0;

            await chartInstance.data.datasets.forEach((dataset) => {
              dataEntries += dataset.data.length;
            });
            if (
              chartInstance.data.labels.length !== 0 &&
              chartInstance.data.labels.length === dataEntries
            ) {
              noDataMatch.value = true;
            } else {
              noDataMatch.value = false;
            }
            chartInstance.update();
          }
        }
      }
    );

    watch(
      () => props.graphSetting,
      () => {
        changeGraph(props.graphSetting);
      }
    );

    return {
      canvas,
      changeGraph,
      cardHeight,
      noDataAlert,
      noDataMatch,
      overlay,
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
