<template>
  <div id="mathfield" ref="mathfield"></div>
</template>

<script>
import { MathfieldElement } from "mathlive";

export default {
  name: "MathField",
  props: ["expression"],
  emits: ["update:expression"],
  data() {
    return {
      mathfield: null,
    };
  },
  mounted() {
    // Ensure the library is correctly imported and MathfieldElement is available
    if (typeof MathfieldElement !== "undefined") {
      // Create a new instance of the MathfieldElement
      this.mathfield = document.createElement("math-field");
      MathfieldElement.soundsDirectory = null;
      MathfieldElement.fontsDirectory = null;

      // Configure the math field
      this.mathfield.value = this.modelValue;
      this.mathfield.readonly = true;

      // Append the math field to the DOM
      this.$refs.mathfield.appendChild(this.mathfield);
    } else {
      console.error(
        "MathfieldElement is not defined. Please check your imports.",
      );
    }
  },
  beforeUnmount() {
    if (this.mathfield && this.$refs.mathfield.contains(this.mathfield)) {
      this.$refs.mathfield.removeChild(this.mathfield);
    }
  },
  watch: {
    expression(newVal) {
      if (newVal !== this.mathfield.value) {
        this.mathfield.value = newVal;
      }
    },
  },
};
</script>

<style scoped src="../../node_modules/mathlive/dist/mathlive-fonts.css"></style>
<style
  scoped
  src="../../node_modules/mathlive/dist/mathlive-static.css"
></style>
<style scoped>
#mathfield :deep(math-field) {
  width: 100%;
  position: relative;
  font-size: 24px;
  border-radius: 4px;
  z-index: 1;
  padding: 8px;
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
