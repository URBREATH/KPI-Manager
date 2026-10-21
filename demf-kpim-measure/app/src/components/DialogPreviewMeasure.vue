<template>
  <v-dialog v-model="toggleModal" width="auto" min-width="500" scrollable persistent>
    <v-card>
      <v-card-title class="bg-secondary">
        <div>{{ $t("strings.measure-preview") }}</div>
      </v-card-title>
      <v-card-text v-if="measureResponse.status < 300">
        <div class="d-flex justify-center text-center">
          <span class="text-h6 text-medium-emphasis font-weight-regularalign-self-center">
            {{ $t("strings.measure-has") }}
          </span>
          <span class="mx-2 text-primary text-h4 font-weight-bold text-center">
            {{ measureResponse.data[0] !== undefined ? measureResponse.data[0].length : 0 }}
          </span>
          <span color="primary" class="text-right text-overline align-self-end">
            {{ $t("strings.values") }}
          </span>
        </div>
        <v-divider class="mt-4 mx-n6"></v-divider>
        <v-expansion-panels elevation="0" :ripple="false" rounded class="pt-6" :eager="true">
          <v-expansion-panel>
            <v-expansion-panel-title class="text-overline">
              {{ $t("strings.show-details") }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              {{ measureResponse.data[0] !== undefined ? measureResponse.data[0].toString() : "" }}
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
      <v-card-text v-else class="font-weight-medium text-center">
        {{ $t("strings.measure-parameters-alert") }}
        <p class="mt-4 text-caption text-secondary text-left">
          {{ measureResponse.message }}
        </p>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text="Close" @click="toggleModal = false"></v-btn>
        <v-btn v-if="measureResponse.status < 300" color="secondary darken-1" text @click="save()">
          {{ measureId ? $t("labels.update") : $t("labels.save") }}
        </v-btn>
      </v-card-actions>
      <v-divider></v-divider>
      <span class="pa-1 rounded px-4">
        <p>{{ $t("strings.preview-warning") }}</p>
      </span>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["dialog", "measureResponse", "measureId"],
  emits: ["save"],
  data() {
    return {};
  },
  methods: {
    save() {
      this.$emit("save");
    },
  },
  computed: {
    toggleModal: {
      get() {
        return this.dialog;
      },
      set(val) {
        this.$emit("previewDialog", val);
      },
    },
  },
};
</script>
