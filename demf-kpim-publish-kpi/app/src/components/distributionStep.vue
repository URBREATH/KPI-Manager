<script setup>
const props = defineProps({
  modelValue: Object
})

const emit = defineEmits(['update:modelValue'])

function updateField(field, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}
</script>

<template>
  <v-layout>
    <v-main :class="containerState">
      <v-card
        class="pt-0 mb-2 px-3"
        ref="mainContainerDefinition"
        id="main-container-definition"
        flat
      >
  <div>
    <v-text-field
      :label="$t('labels.title')"
      :model-value="modelValue.title"
      @update:model-value="v => updateField('title', v)"
    />
    <v-text-field
      :label="$t('labels.description')"
      :model-value="modelValue.description"
      @update:model-value="v => updateField('description', v)"
    />
    <v-text-field
      :label="$t('labels.accessUrl')"
      :model-value="modelValue.accessUrl"
      @update:model-value="v => updateField('accessUrl', v)"
    />
    <v-text-field
      :label="$t('labels.format')"
      :model-value="modelValue.format"
      @update:model-value="v => updateField('format', v)"
    />
  <!--<v-text-field
      label="Media type"
      :model-value="modelValue.mediaType"
      @update:model-value="v => updateField('mediaType', v)"
    />-->

    <v-select
:model-value="modelValue.license"
  :items="licenses"
  item-title="label"
  item-value="value"
  :label="$t('labels.license')"
  variant="outlined"
  density="comfortable"
   @update:model-value="v => updateField('license', v)"
/>


    <!--<v-text-field
      label="Access Rights"
      :model-value="modelValue.accessRights"
      @update:model-value="v => updateField('accessRights', v)"
    />-->
  </div>
</v-card>
</v-main>
</v-layout>
</template>

<script>
import licenses from "@/constants/licenses.json";
export default {


  data() {
    return {
      licenses
   
    };
  },

};
</script>



