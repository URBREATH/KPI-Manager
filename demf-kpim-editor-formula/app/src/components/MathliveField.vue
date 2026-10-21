<template>
  <div id="mathfield" ref="mathfield"></div>
  <v-dialog v-model="isModalVisible">
    <v-card
      :style="{ top: modalPosition.top + 'px', left: modalPosition.left + 'px' }"
      class="w-25"
    >
      <v-card-title class="bg-secondary ma-0">{{ $t("labels.selectOption") }}</v-card-title>
      <v-list>
        <v-list-item @click="selectOption('\\max')"
          >Max (<strong class="text-primary">max</strong>)</v-list-item
        >
        <v-list-item @click="selectOption('\\min')"
          >Min (<strong class="text-primary">min</strong>)
        </v-list-item>
        <v-list-item @click="selectOption('med')"
          >{{ $t("labels.median") }} (
          <strong class="text-primary">med</strong>
          )</v-list-item
        >
        <v-list-item @click="selectOption('\\mu')"
          >{{ $t("labels.mean") }} (
          <strong class="text-primary">&mu;</strong>
          )
        </v-list-item>
        <v-list-item @click="selectOption('Mo')"
          >{{ $t("labels.mode") }} (<strong class="text-primary">Mo</strong>)
        </v-list-item>
        <v-list-item @click="selectOption('\\sigma')"
          >{{ $t("labels.stddev") }} (
          <strong class="text-primary">&sigma;</strong>
          )</v-list-item
        >
        <v-list-item @click="selectOption('&Sigma;')"
          >{{ $t("labels.sum") }} (<strong class="text-primary">&Sigma;</strong>)</v-list-item
        >
      </v-list>
      <v-card-actions>
        <v-btn variant="outlined" color="secondary" @click="isModalVisible = false">{{
          $t("labels.cancel")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { MathfieldElement } from "mathlive";

export default {
  name: "MathField",
  props: ["valueFormula"],
  emits: ["writeFormula"],
  data() {
    return {
      mathfield: null,
      formulaValue: this.valueFormula,

      isModalVisible: false,
      modalPosition: { top: 0, left: 0 },
      content: "",
    };
  },
  mounted() {
    // Ensure the library is correctly imported and MathfieldElement is available
    if (typeof MathfieldElement !== "undefined") {
      // Create a new instance of the MathfieldElement
      this.mathfield = document.createElement("math-field");
      MathfieldElement.soundsDirectory = null;
      MathfieldElement.fontsDirectory = ""; //using CDN

      this.$nextTick(() => {
        this.mathfield.value = this.valueFormula;
      });

      this.mathfield.addEventListener("input", () => {
        this.formulaValue = this.mathfield.value; // Update 'formulaValue'
      });
      this.$refs.mathfield.appendChild(this.mathfield);
      document.documentElement.style.setProperty("--keyboard-zindex", "3000");

      // Add a listener for the drop event
      this.mathfield.addEventListener("drop", async (event) => {
        event.preventDefault();
        // Get the dragged data
        this.modalPosition.left = event.clientX;
        if (
          this.modalPosition.left + (this.modalPosition.left / 100) * 25 >
          window.innerWidth - 150
        ) {
          this.modalPosition.left =
            window.innerWidth - ((this.modalPosition.left / 100) * 25 + window.innerWidth / 10);
        }
        this.modalPosition.top = ((window.innerHeight / event.clientY) * 80 - 200) * -1;
        const data = event.dataTransfer.getData("text");

        // Show the modal and wait for the user to select an option
        const selectedOption = await this.showModalAndWaitForSelection();

        // Insert the data into the math field at the current position
        this.mathfield.insert(this.latexComposition(selectedOption, data));
      });
      // Add a listener for the dragover event
      this.mathfield.addEventListener("dragover", (event) => {
        event.preventDefault();
      });
    } else {
      console.error("MathfieldElement is not defined. Please check your imports.");
    }
  },
  beforeUnmount() {
    if (this.mathfield && this.$refs.mathfield.contains(this.mathfield)) {
      this.$refs.mathfield.removeChild(this.mathfield);
    }
  },
  methods: {
    //ingests the operator and data selected by the user and returns the latex composition
    latexComposition(operator, data) {
      return operator + `\\left(${data.trim().replace(/\s/g, "")}\\right)`;
    },
    selectOption(option) {
      this.content = option;
      this.isModalVisible = false;
      if (this.resolveModal) {
        this.resolveModal(option);
      }
    },
    showModalAndWaitForSelection() {
      return new Promise((resolve) => {
        this.isModalVisible = true;
        this.resolveModal = resolve;
      });
    },
  },
  watch: {
    value(newVal) {
      if (newVal !== this.formulaValue) {
        this.formulaValue = newVal;
      }
    },
    formulaValue(newVal) {
      this.$emit("writeFormula", newVal); // Emit the event when 'formulaValue' changes
    },
  },
};
</script>

<style scoped src="../../node_modules/mathlive/dist/mathlive-fonts.css"></style>
<style scoped src="../../node_modules/mathlive/dist/mathlive-static.css"></style>
<style scoped>
#mathfield :deep(math-field) {
  width: 100%;
  position: relative;
  font-size: 24px;
  z-index: 1;
  border-radius: 4px;
  padding: 8px;
  margin-left: 2px;
}
</style>
