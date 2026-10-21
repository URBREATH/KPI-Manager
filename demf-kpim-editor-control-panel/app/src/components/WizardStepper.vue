<template>
  <v-sheet color="white" class="activePosition">
    <!-- Stepper -->
    <v-stepper app :value="step" :model-value="step" @input="updateStep" color="secondary">
      <v-stepper-header>
        <v-stepper-item
          :complete="editableSteps.definition > 0"
          :editable="editableSteps.definition > 0 && step != 1"
          value="1"
          color="secondary"
          @click="goToStep('definition')"
        >
          {{ $t("labels.definition") }}
        </v-stepper-item>
        <v-divider></v-divider>

        <v-stepper-item
          :complete="editableSteps.formula > 0"
          value="2"
          :editable="editableSteps.formula > 0 && step != 2"
          color="secondary"
          @click="goToStep('formula')"
        >
          {{ $t("labels.formula") }}
        </v-stepper-item>
        <v-divider></v-divider>

        <v-stepper-item
          :complete="editableSteps.dashboard > 0"
          value="3"
          :editable="editableSteps.dashboard > 0 && step != 3"
          color="secondary"
          @click="goToStep('dashboard')"
        >
          {{ $t("labels.dashboard") }}
        </v-stepper-item>
        <v-divider></v-divider>

        <v-stepper-item
          :complete="editableSteps.summary > 0"
          value="4"
          :editable="editableSteps.summary > 0 && step != 4"
          color="secondary"
          @click="goToStep('summary')"
        >
          {{ $t("labels.summary") }}
        </v-stepper-item>
      </v-stepper-header>
    </v-stepper>
  </v-sheet>
</template>

<script>
export default {
  props: ["step"],
  data() {
    return {
      editableSteps: {
        definition: 0,
        formula: 0,
        dashboard: 0,
        summary: 0,
      },
    };
  },
  created() {
    this.updateEditableSteps();
  },
  mounted() {
    this.eventListener = (event) => {
      this.setEditableStep(event.detail.step, event.detail.value);
    };
    // Listen for custom 'editable-steps' events to update steps
    document.addEventListener("editable-steps", this.eventListener);
  },
  beforeUnmount() {
    // Clean up event listener to prevent memory leaks
    document.removeEventListener("editable-steps", this.eventListener);
  },
  updated() {
    this.updateEditableSteps();
  },

  methods: {
    //Goes to path page
    routeTo(path) {
      this.$router.push({ path });
    },
    //Links Step click to relative route
    goToStep(key) {
      if (this.editableSteps[key] > 0) {
        this.routeTo(`/editor/${key}`);
      }
    },

    updateStep(newValue) {
      this.$emit("update:step", newValue);
    },

    // Updates editable steps from from kpi value in sessionStorage
    updateEditableSteps() {
      const kpi = JSON.parse(sessionStorage.getItem("kpi"));
      let keys = Object.keys(this.editableSteps);
      let foundAllExceptSummary = true;

      if (kpi) {
        for (let key of keys) {
          if (key in kpi) {
            this.editableSteps[key] = 1;
          } else {
            if (key !== "summary") {
              foundAllExceptSummary = false;
            }
          }
        }
        if (foundAllExceptSummary) {
          this.editableSteps["summary"] = 1;
        }
      }
    },

    // Set the editable status of a step
    setEditableStep(step, value) {
      this.editableSteps[step] = value;
    },
  },
};
</script>
