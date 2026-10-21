<template>
  <div class="my-2" id="mathfield" ref="mathfield"></div>
</template>

<script>
import { MathfieldElement } from "mathlive";

export default {
  name: "MathField",
  props: ["measuresArray"],
  data() {
    return {
      mathfield: null,
      measure: "newMeasure",
      isModalVisible: false,
      modalPosition: { top: 0, left: 0 },
      content: "",
    };
  },
  mounted() {
    if (typeof MathfieldElement !== "undefined") {
      this.mathfield = document.createElement("math-field");
      MathfieldElement.soundsDirectory = null;
      MathfieldElement.fontsDirectory = ""; // using CDN
      this.mathfield.readonly = true;
      this.$refs.mathfield.appendChild(this.mathfield);
    } else {
      console.error("MathfieldElement is not defined. Please check your imports.");
    }
  },
  watch: {
    measuresArray(newVal) {
      if (newVal.length > 0) {
        this.setMeasureName();
      }
    },
  },
  methods: {
    setMeasureName() {
      let randomIndex = Math.floor(Math.random() * this.measuresArray.length);
      this.measure = this.measuresArray[randomIndex].name;
      this.mathfield.value = `\\frac{\\max\\left(${this.measure}\\right) + \\min\\left(${this.measure}\\right)}{2}`;
    },
  },
  beforeUnmount() {
    if (this.mathfield && this.$refs.mathfield.contains(this.mathfield)) {
      this.$refs.mathfield.removeChild(this.mathfield);
    }
    this.mathfield = null;
  },
};
</script>

<style scoped src="../../node_modules/mathlive/dist/mathlive-fonts.css"></style>
<style scoped src="../../node_modules/mathlive/dist/mathlive-static.css"></style>
<style scoped>
#mathfield >>> math-field {
  width: 100%;
  position: relative;
  font-size: 24px;
  z-index: 1;
  border-radius: 4px;
  padding: 8px;
  margin-left: 2px;
}
</style>
