<template>
  <v-layout>
    <v-main :class="containerState">
      <v-container id="main-container" :fluid="true" class="pt-0">
        <!-- Toolbar -->
        <v-app-bar id="upp-bar" color="white" :flat="true" class="px-4">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2" size="large"> mdi-compare </v-icon>
            <a class="text-primary text-h5 text-decoration-none font-weight-light" href="/kpis">
              {{ $t("labels.kpis-list") }}
            </a>
            <v-icon>mdi-chevron-right</v-icon>
            <a class="text-primary text-h5 text-decoration-none font-weight-light">
              {{ $t("labels.page-title") }}
            </a>
            &nbsp;
            <v-tooltip bottom color="primary" class="hidden-lg-and-up">
              <template v-slot:activator="{ props }">
                <div class="text-primary text-h5 font-weight-bold text-truncate" v-bind="props">
                  {{ sessionKpi.name }}
                </div>
              </template>
              <span>{{ sessionKpi.name }}</span>
            </v-tooltip>
          </div>
        </v-app-bar>
        <v-card class="ms-12" flat>
          <v-card-title class="py-0">
            <v-Row class="pb-4 pe-0 d-flex justify-space-between">
              <span class="pa-0 ps-2 mt-2">
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      class="me-2"
                      size="small"
                      color="secondary"
                      v-bind="props"
                      @click="getKPIsList()"
                      :disabled="loading"
                    >
                      mdi-refresh
                    </v-icon>
                  </template>
                  <span>{{ $t("labels.refresh") }}</span>
                </v-tooltip>

                <v-tooltip v-if="sort === 'AZ'" location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      class="me-2"
                      size="small"
                      color="secondary"
                      v-bind="props"
                      @click="sortAZ()"
                      :disabled="loading"
                    >
                      mdi-sort-alphabetical-ascending
                    </v-icon>
                  </template>
                  <span>{{ $t("labels.sort-AZ") }}</span>
                </v-tooltip>

                <v-tooltip v-else location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      class="me-2"
                      size="small"
                      color="secondary"
                      v-bind="props"
                      @click="sortZA()"
                      :disabled="loading"
                    >
                      mdi-sort-alphabetical-descending
                    </v-icon>
                  </template>
                  <span>{{ $t("labels.sort-ZA") }}</span>
                </v-tooltip>
              </span>
              <span class="pa-0 mt-2 w-50 d-flex align-start justify-end">
                <DateRangePicker
                  :parentDateRange="dateRange"
                  :loading="loading"
                  :validateForms="validateForms"
                  @validForms="validForms = $event"
                  @date-range-changed="dateRange = $event"
                />
                <span class="mx-2"></span>
                <v-dialog max-width="500">
                  <template v-slot:activator="{ props: dialogProps }">
                    <v-btn
                      class="mt-1"
                      color="secondary darken-1"
                      variant="elevated"
                      flat
                      v-bind="{ ...tooltipProps, ...dialogProps }"
                    >
                      {{ $t("labels.settings") }} &nbsp; <v-icon>mdi-cog</v-icon>
                    </v-btn>
                  </template>
                  <template v-slot:default="{ isActive }">
                    <v-card :title="$t('labels.settings')" class="pa-0">
                      <v-card-text>
                        <v-row class="d-flex align-center py-0 px-4">
                          <v-switch
                            v-model="rounded"
                            :false-value="0"
                            :true-value="1"
                            hide-details
                            color="secondary"
                            :disabled="loading"
                          >
                            <template v-slot:label>
                              <div v-if="rounded" class="text-button" color="black">
                                {{ $t("labels.round-up") }}
                              </div>
                              <div v-else class="text-button">
                                {{ $t("labels.round-down") }}
                              </div>
                            </template>
                          </v-switch>
                        </v-row>
                        <v-row class="border-b-sm px-4">
                          <span class="py-0 text-subtitle-2"> {{ $t("strings.round") }}</span>
                        </v-row>
                      </v-card-text>

                      <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn
                          color="secondary darken-1"
                          variant="elevated"
                          @click="isActive.value = false"
                          >{{ $t("labels.close") }}</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-dialog>
              </span>
            </v-Row>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-row class="d-flex justify-center">
              <v-col cols="4" class="pt-0">
                <div class="text-overline">{{ $t("labels.comparison-add") }}</div>
                <v-alert
                  v-if="
                    KPIs.filter(
                      (item) =>
                        item.name !== sessionKpi.name &&
                        item.definition.unitMeasure === sessionKpi.definition.unitMeasure
                    ).length === 0
                  "
                  type="info"
                >
                  {{ $t("strings.no-items-available") }}
                </v-alert>
                <v-virtual-scroll v-else :items="KPIs" :height="scrollHeight">
                  <template v-slot="{ item }">
                    <v-list-item
                      v-if="
                        item.name !== sessionKpi.name &&
                        item.definition.unitMeasure === sessionKpi.definition.unitMeasure &&
                        item.formula.job.schedule.time === sessionKpi.formula.job.schedule.time &&
                        item.formula.job.schedule.value === sessionKpi.formula.job.schedule.value
                      "
                      :key="item.name"
                      :disabled="loading"
                      class="border-b-sm ps-0"
                      :ripple="false"
                      @click="toggleKpi(item.name)"
                    >
                      <v-list-item-title>{{ item.name }}</v-list-item-title>
                      <template v-slot:prepend
                        ><v-checkbox
                          v-if="!selected.includes(item.name)"
                          :modelValue="false"
                          density="comfortable"
                          hide-details
                        ></v-checkbox>
                        <v-checkbox
                          v-if="selected.includes(item.name)"
                          :modelValue="true"
                          color="primary"
                          density="comfortable"
                          hide-details
                        ></v-checkbox>
                      </template>
                    </v-list-item>
                  </template>
                </v-virtual-scroll>
              </v-col>
              <v-col class="pa-0" cols="8">
                <v-row class="pa-0 ma-0">
                  <v-btn-toggle
                    density="compact"
                    v-model="toggle_exclusive"
                    mandatory
                    color="light-grey"
                    rounded="0"
                    :disabled="loading"
                  >
                    <v-btn @click="changeGraph('line')"> {{ $t("labels.line") }} </v-btn>
                    <v-btn @click="changeGraph('bar')"> {{ $t("labels.bar") }} </v-btn>
                  </v-btn-toggle>
                </v-row>
                <Chart
                  :containerHeight="containerHeight"
                  :data="chartData"
                  :type="sessionKpi.dashboard.chart.type"
                  :target-value="sessionKpi.definition.targetValue"
                  :graphSetting="graphType"
                  :stacked="stacked"
                  :updateInput="updateInput"
                  :loading="loading"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pb-0 pe-0">
            <v-btn color="secondary darken-1" variant="elevated" @click="routeToHome()">
              {{ $t("labels.cancel") }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-tooltip bottom :disabled="selected.length > 1">
              <template v-slot:activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    :disabled="KPIs.length > 1 && selected.length < 2"
                    :loading="loading"
                    color="secondary darken-1"
                    variant="elevated"
                    @click="createChart()"
                  >
                    {{ $t("labels.compare") }}
                  </v-btn>
                </div>
              </template>
              <span>{{ $t("strings.kpi-required") }}</span>
            </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script>
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import version from "../version";
import methods from "./mixins/methods";
import Chart from "@/components/ChartComponent.vue";
import DateRangePicker from "./components/DateRangePicker.vue";

export default {
  name: "KpiCompare",
  mixins: [utils, events, methods],
  props: ["compareConfig", "realm"],
  components: {
    Chart,
    DateRangePicker,
  },

  data: function () {
    return {
      appVersion: version,
      sessionKpi: {},
      KPIs: [],
      loading: false,
      selected: [],
      chartData: {
        labels: [],
        datasets: [],
      },
      containerHeight: "100%",
      scrollHeight: "100%",
      toggle_exclusive: 0,
      toggle_multiple: [],
      graphType: "line",
      stacked: false,
      dateRange: {
        start: null,
        end: null,
        rangeAtLoading: false,
      },
      timeSpanActive: false,
      rounded: 0,
      updateInput: false,
      scheduleTime: {
        time: "",
        value: 0,
      },
      validateForms: false,
      validForms: false,
      lengthCheck: true,
      sort: "AZ",
    };
  },

  beforeMount() {
    this.sessionKpi = { ...JSON.parse(sessionStorage.getItem("kpi")) };
    this.setRangeAtLoading(this.sessionKpi.name);
  },

  async mounted() {
    console.log("Mounted demf-compare v", this.appVersion);

    document.addEventListener("language-localstorage-changed", (event) => {
      this.setLocale(event.detail.storage);
    });

    this.containerState = localStorage.getItem("sidenav") === "opened" ? "reduced" : "expanded";

    document.addEventListener("sidenav-localstorage-changed", (event) => {
      this.containerState = event.detail.storage === "opened" ? "reduced" : "expanded";
    });

    this.$nextTick(() => {
      this.updateContainerHeight(); // Update dimensions
      window.addEventListener("resize", this.updateContainerHeight);
    });

    this.getKPIsList();
    this.selected.push(this.sessionKpi.name);

    this.scheduleTime = this.sessionKpi.formula.job.schedule;
  },
  methods: {
    toggleKpi(kpiName) {
      if (this.selected.includes(kpiName)) {
        this.removeKpi(kpiName);
      } else {
        this.addKpi(kpiName);
      }
    },
    async addKpi(kpiName) {
      this.selected = [...this.selected, kpiName];
    },
    async removeKpi(kpiName) {
      this.selected = this.selected.filter((item) => item !== kpiName);
    },
    createChart() {
      this.updateInput = false;
      this.loading = true;
      this.validateForms = !this.validateForms;

      this.selected.length < 2 ? (this.lengthCheck = false) : (this.lengthCheck = true);
      this.timesCalled = 0;
      this.backgroundColorCount = 0;
      //reset chartData
      this.chartData.labels.length = 0;
      this.chartData.datasets.length = 0;

      //checks if the date range is valid
      //setTimeOut is used to wait for the validForms to be updated
      setTimeout(async () => {
        if (this.validForms && this.selected.length > 1) {
          for (const [index, kpiName] of this.selected.entries()) {
            await this.updateChartData(kpiName, index);
          }
        } else {
          this.loading = false;
        }
      }, 200);
    },
    updateContainerHeight() {
      // Gets the container element from the ID
      const element = document.getElementById("main-container");
      if (element) {
        // Get the CSS values of the element
        var elementCss = window.getComputedStyle(element);
        // Get the height value in pixels
        this.containerHeight = elementCss.getPropertyValue("height");
        this.scrollHeight = "calc(" + this.containerHeight + " - 185px)";
      } else {
        console.warn("Not Found: ", element);
      }
    },
    changeGraph(val) {
      this.graphType = val;
    },
  },
};
</script>
<style scoped>
main.expanded {
  margin-left: 56px;
}
main.expanded header#upp-bar {
  margin-left: 56px;
  width: calc(100% - 56px) !important;
}
main.reduced {
  margin-left: 256px;
}
main.reduced header#upp-bar {
  margin-left: 256px;
  width: calc(100% - 256px) !important;
}
#main-container {
  height: calc(100vh - 104px);
  overflow-y: auto;
  background-color: white;
}
</style>
