<template>
  <div class="outlined" id="mathfield" ref="mathfield"></div>
</template>

<script>
import { MathfieldElement } from "mathlive";

export default {
  name: "previewMathField",
  props: ["valueFormula"],
  data() {
    return {
      mathfield: null,
      formulaValue: this.valueFormula,
    };
  },
  mounted() {
    // Ensure the library is correctly imported and MathfieldElement is available
    if (typeof MathfieldElement !== "undefined") {
      // Create a new instance of the MathfieldElement
      this.mathfield = document.createElement("math-field");
      MathfieldElement.soundsDirectory = null;
      MathfieldElement.fontsDirectory = null;

      this.mathfield.value = this.valueFormula;
      this.mathfield.readonly = true;

      this.$refs.mathfield.appendChild(this.mathfield);
      document.documentElement.style.setProperty("--keyboard-zindex", "3000");
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
      return operator + `\\left(${data.trim()}\\right)`;
    },
  },
  watch: {
    value(newVal) {
      if (newVal !== this.formulaValue) {
        this.formulaValue = newVal;
      }
    },
  },
  render(h) {
    return h("div", { ref: "mathfield" });
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
}

.outlined {
  border: 1px solid #ced4da;
  border-radius: 4px;
}

@media not (pointer: coarse) {
  math-field::part(virtual-keyboard-toggle) {
    display: none;
  }
  math-field::part(menu-toggle) {
    display: none;
  }
}
</style>
