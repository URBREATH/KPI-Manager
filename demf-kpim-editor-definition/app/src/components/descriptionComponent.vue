<template>
  <v-card class="mx-2 mb-2 w-50" :height="containerHeight">
    <v-textarea
      class="mx-4 mt-6 h-100"
      v-model="description"
      :label="$t('labels.description')"
      persistent-hint
      variant="outlined"
      density="compact"
      name="description"
      no-resize
    ></v-textarea>
  </v-card>
</template>
<script>
import commonMethods from "../mixins/commonMethods";
import utils from "../mixins/utils";

export default {
  mixins: [commonMethods, utils],
  props: ["parentDescription", "parentValidFields", "kpimEditorConfig", "realm", "parentHeight"],
  emits: ["writeDescription", "writeValidFields"],
  data() {
    return {
      description: "",
    };
  },
  mounted() {
    this.updateContainerHeight(); // Update dimensions
    window.addEventListener("resize", this.updateContainerHeight);
    this.$nextTick(() => {
      this.description = this.parentDescription;
    });
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.updateContainerHeight);
  },

  watch: {
    description(value) {
      this.$emit("writeDescription", value);
    },

    parentHeight(value) {
      this.containerHeight = value;
    },
  },
};
</script>
