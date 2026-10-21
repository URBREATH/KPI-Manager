<template>
  <v-card class="px-2 pt-2">
    <div class="text-subtitle-1 mx-1 text-primary">
      {{ $t("labels.title-target") }}
    </div>

    <div class="ma-0 pa-0 mb-4 ms-2 text-caption text-wrap">
      {{ $t("strings.values-form") }}
    </div>

    <v-form
      class="d-flex ga-4 pb-0 pt-0"
      ref="definitionForm"
      v-model="validFields"
    >
      <!-- Campo target -->
      <v-text-field
        v-model="targetValue"
        :label="$t('labels.target')"
        variant="outlined"
        :rules="numberRules"
        required
        density="compact"
        name="targetValue"
        hide-details="auto"
        class="w-50 h-50"
      />

      <!-- Select unità di misura -->
      <v-autocomplete
        v-model="currentMeasureValue"
        variant="outlined"
        :items="unitMeasuresWithOther"
        :rules="[(v) => !!v || $t('labels.required')]"
        density="compact"
        :label="$t('labels.unitMeasure')"
        required
        name="unitMeasure"
        class="w-50"
        searchable
        clearable
      />

      <!-- Campo custom -->
      <v-text-field
        v-if="selectedMeasure === '__OTHER__'"
        v-model="customUnitMeasure"
        :label="$t('labels.customUnitMeasure')"
        variant="outlined"
        density="compact"
        class="w-50 mt-2"
        @input="$emit('writeUnitMeasure', customUnitMeasure)"
      />
    </v-form>
  </v-card>
</template>

<script>
import commonMethods from "../mixins/commonMethods";
import utils from "../mixins/utils";
import events from "../mixins/events";

export default {
  mixins: [commonMethods, utils, events],

  props: [
    "parentTargetValue",
    "parentUnitMeasure",
    "parentValidFields",
    "kpimEditorConfig",
    "realm",
  ],

  emits: ["writeTargetValue", "writeUnitMeasure", "writeValidFields"],

  data() {
    return {
      targetValue: this.parentTargetValue,
      selectedMeasure: "",
      customUnitMeasure: "",
      validFields: this.parentValidFields,
      unitMeasures: [],
      numberRules: [
        (v) => this.formatTargetValue(v),
        (v) => !!v || this.$t("labels.required"),
        (v) =>
          !["-", "-0", "-0.", "-."].includes(v) ||
          this.$t("strings.number-hint"),
      ],
    };
  },

  computed: {
    unitMeasuresWithOther() {
      const measures = Array.isArray(this.unitMeasures)
        ? this.unitMeasures
        : [];

      return [
        ...measures,
        { title: this.$t("labels.other"), value: "__OTHER__" },
      ];
    },

    currentMeasureValue: {
      get() {
        return this.selectedMeasure;
      },
      set(val) {
        if (val === "__OTHER__") {
          this.selectedMeasure = "__OTHER__";
          this.customUnitMeasure = "";
          this.$emit("writeUnitMeasure", "");
        } else {
          this.selectedMeasure = val;
          this.customUnitMeasure = "";
          this.$emit("writeUnitMeasure", val);
        }
      },
    },
  },

  mounted() {
    this.getUnitMeasures();
  },

  methods: {
    formatTargetValue(value) {
      if (typeof value === "number") value = value.toString();

      value = value.replace(/[^0-9,.-]/g, "").replace(/,/g, ".");
      if (value.startsWith(".")) value = value.substring(1);
      value = value.replace(/-\./, "-").replace(/(?!^)-/g, "");

      let parts = value.split(".");
      if (parts.length > 2) parts = [parts.slice(0, 2).join(".")];

      for (let i = 0; i < parts.length; i++) {
        if (parts[i].indexOf("-") > 0) {
          parts[i] = parts[i].replace("-", "");
        }
      }

      value = parts.join(".");
      this.targetValue = value;
      this.$emit("writeTargetValue", value);
    },

    normalizeUnitMeasure(val) {
      if (!val || !Array.isArray(this.unitMeasures) || !this.unitMeasures.length) {
        return;
      }

      const exists = this.unitMeasures.some(
        (u) => u.value === val
      );

      if (exists) {
        this.selectedMeasure = val;
        this.customUnitMeasure = "";
      } else {
        this.selectedMeasure = "__OTHER__";
        this.customUnitMeasure = val;
      }
    },
  },

  watch: {
    validFields(value) {
      this.$emit("writeValidFields", value);
    },

    parentTargetValue: {
      immediate: true,
      handler(val) {
        this.targetValue = val;
      },
    },

    parentUnitMeasure: {
      immediate: true,
      handler(val) {
        this.normalizeUnitMeasure(val);
      },
    },

    unitMeasures() {
      this.normalizeUnitMeasure(this.parentUnitMeasure);
    },
  },
};
</script>
