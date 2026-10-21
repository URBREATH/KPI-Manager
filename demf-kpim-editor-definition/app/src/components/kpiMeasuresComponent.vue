<template>
  <v-row v-bind="$attrs" id="listContainer" class="d-flex justify-end flex-row px-2 mb-2">
    <v-col cols="8" class="d-flex flex-column pr-2">
      <!-- Measure and KPI selection -->
      <v-card :height="containerHeight">
        <v-tabs v-model="tab" bg-color="transparent" height="2rem">
          <v-tab value="measures" class="h-100">
            <v-icon color="primary mr-2" icon="mdi-ruler"></v-icon
            >{{ $t("labels.measures") }}</v-tab
          >
          <v-tab value="kpis" class="h-100"
            ><v-icon color="primary mr-2" icon="mdi-gauge"></v-icon>{{ $t("labels.kpis") }}</v-tab
          >
        </v-tabs>
        <div class="text-caption pt-2 px-3 text-grey">
          {{ $t("strings.arrow-button-hint") }}
        </div>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="measures">
            <div class="d-flex flex-column">
              <v-container>
                <v-row justify="start">
                  <v-col class="py-0 px-2" cols="12">
                    <v-text-field
                      ref="searchField"
                      v-model="search"
                      :label="$t('labels.search')"
                      variant="outlined"
                      hide-details
                      single-line
                      density="compact"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>

              <v-divider></v-divider>

              <v-virtual-scroll :items="measuresSearchResult" :height="leftScrollHeight">
                <template v-slot:default="{ item }">
                  <v-list-item
                    v-if="!selected.includes(item)"
                    :key="item.name"
                    :disabled="loading"
                    class="border-b-sm"
                  >
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <template v-slot:append
                      ><v-btn
                        color="primary"
                        density="compact"
                        icon="mdi-arrow-right-bold"
                        @click="selected.push(item)"
                      ></v-btn
                    ></template>
                  </v-list-item>
                </template>
              </v-virtual-scroll>
            </div>
          </v-tabs-window-item>
          <v-tabs-window-item value="kpis">
            <div>
              <v-container>
                <v-row justify="start">
                  <v-col class="py-0 px-2" cols="12">
                    <v-text-field
                      ref="searchField"
                      v-model="search"
                      :label="$t('labels.search')"
                      hide-details
                      variant="outlined"
                      single-line
                      density="compact"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>

              <v-divider></v-divider>
              <v-virtual-scroll :items="kpisSearchResult" :height="leftScrollHeight">
                <template v-slot:default="{ item }">
                  <v-list-item
                    v-if="!selected.includes(item)"
                    :key="item.name"
                    :disabled="loading"
                    class="border-b-sm"
                  >
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <template v-slot:append
                      ><v-btn
                        color="primary"
                        density="compact"
                        icon="mdi-arrow-right-bold"
                        @click="selected.push(item)"
                      ></v-btn
                    ></template>
                  </v-list-item>
                </template>
              </v-virtual-scroll>

              <v-divider></v-divider>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>
    </v-col>
    <v-col cols="4" class="d-flex flex-column ps-2">
      <!-- END Measure and KPI selection -->
      <!-- List of selected items -->
      <v-card :height="containerHeight">
        <v-toolbar :flat="true" color="secondary" density="comfortable">
          <v-toolbar-title class="text-white">
            {{ $t("labels.selected") }}

            <div class="text-caption">
              {{ $t("strings.selected-items-hint") }}
            </div>
          </v-toolbar-title>
          <div>
            <v-tooltip activator="parent" location="top"
              ><span>{{ $t("labels.delete-all") }}</span></v-tooltip
            ><v-btn
              variant="plain"
              :disabled="loading"
              @click="selected.splice(0, selected.length)"
              icon="mdi-delete-sweep"
            >
            </v-btn>
          </div>
        </v-toolbar>
        <v-skeleton-loader v-if="loading" type="paragraph"></v-skeleton-loader>
        <v-virtual-scroll id="rightScroll" :items="selected" :height="rightScrollHeight">
          <template v-slot:default="{ item }">
            <v-list-item :key="item.name" class="pa-1 border-b-sm">
              <v-list-item-title class="d-flex">
                <v-icon color="primary" class="mr-2" :icon="checkIcon(item)"></v-icon>
                {{ item.name }}
              </v-list-item-title>
              <template v-slot:append>
                <div>
                  <v-tooltip activator="parent" location="top">
                    <span>{{ $t("labels.delete") }}</span>
                  </v-tooltip>
                  <v-btn
                    variant="plain"
                    :disabled="loading"
                    @click="selected.splice(i, 1)"
                    icon="mdi-delete"
                    color="secondary"
                  ></v-btn>
                </div>
              </template>
            </v-list-item>
          </template>
        </v-virtual-scroll>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import commonMethods from "../mixins/commonMethods";
export default {
  name: "kpiMeasuresComponent",
  mixins: [events, utils, commonMethods],
  inheritAttrs: false,
  props: [
    "kpimEditorConfig",
    "realm",
    "parentLoading",
    "parentSelected",
    "parentSessionItem",
    "parentHeight",
  ],
  emits: ["writeSelected", "writeLoading", "writeSessionItem"],
  data() {
    return {
      tab: null,
      search: "",

      KPIs: [],

      measures: [],
      selected: [],
      loading: true,
      sessionItem: {},
    };
  },
  async mounted() {
    this.updateContainerHeight(); // Update dimensions
    window.addEventListener("resize", this.updateContainerHeight);
    this.$nextTick(() => {
      this.selected = this.parentSelected;
      this.loading = this.parentLoading;
      this.sessionItem = this.parentSessionItem;
    });

    //loading will become false when completing getKPIsList - either with failure or success
    try {
      await this.getMeasures();
      await this.getKPIsList();
    } finally {
      this.loading = false; // Ensure loading is always set to false
    }

    this.dispatchSelected();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateContainerHeight);
  },
  methods: {
    checkIcon(selection) {
      if (selection.context) {
        return "mdi-gauge";
      }
      if (selection.type) {
        return "mdi-ruler";
      }
    },
  },

  computed: {
    allMeasuresSelected() {
      let count = 0;
      this.measures.forEach((item) => {
        if (this.selected.includes(item)) {
          count++;
        }
      });

      return this.measures.length === count;
    },
    allKpisSelected() {
      let count = 0;
      this.KPIs.forEach((item) => {
        if (this.selected.includes(item)) {
          count++;
        }
      });

      return this.KPIs.length === count;
    },
    measuresSearchResult() {
      const search = this.search.toLowerCase();

      if (!search) return this.measures;

      return this.measures.filter((item) => {
        //convert item to text and looks in it for matches - might consider replacing for the actual measures
        const text = item.name.toLowerCase();

        return text.indexOf(search) > -1;
      });
    },
    kpisSearchResult() {
      const search = this.search.toLowerCase();

      if (!search) return this.KPIs;

      return this.KPIs.filter((kpi) => {
        //convert kpi to text and looks in it for matches
        const text = kpi.name.toLowerCase();

        return text.indexOf(search) > -1;
      });
    },
  },
  watch: {
    selected(value) {
      this.$emit("writeSelected", value);
    },
    parentLoading(value) {
      this.loading = value;
    },
    loading(value) {
      this.$emit("writeLoading", value);
    },
    sessionItem(value) {
      this.$emit("writeSessionItem", value);
    },
    parentHeight(value) {
      this.containerHeight = value;
    },
  },
};
</script>
