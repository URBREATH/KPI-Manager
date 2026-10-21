<template>
  <v-sheet class="mx-auto" flat height="100%" :max-height="cardHeight">
    <v-slide-group
      selected-class="bg-primary"
      show-arrows
      direction="vertical"
      next-icon="mdi-chevron-down"
      prev-icon="mdi-chevron-up"
    >
      <v-slide-group-item v-for="item in chartTypes" :key="item.type">
        <v-card
          class="my-2 mx-0"
          color="grey-lighten-1"
          width="auto"
          max-height="150"
          @click="selectChart(item)"
        >
          <div class="d-flex fill-height align-center justify-center">
            <v-card
              class="chart-preview-container pa-1 h-100 w-100"
              :elevation="0"
              :flat="true"
              variant="elevated"
              :ripple="false"
              border
            >
              <v-card-title class="pa-1 text-center text-capitalize">
                {{ item.type === "area" ? "area" : item.type }}
              </v-card-title>
              <v-card-text class="px-4 pt-0 pb-1">
                <div style="height: 100px">
                  <chart-preview-component
                    class="chart-preview"
                    :type="item.type"
                    :data="item.data"
                    :labels="item.labels"
                  />
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>
  </v-sheet>
</template>

<script setup>
import { defineProps, computed } from "vue";
import ChartPreviewComponent from "./ChartPreviewComponent.vue";

const emit = defineEmits(["selectedChart"]);
const props = defineProps({
  sliderHeight: String,
  chartTypes: Array,
});

const cardHeight = computed(() => {
  return `calc(${props.sliderHeight} - 32px)`;
});

function selectChart(chartType) {
  emit("selectedChart", chartType);
}
</script>
