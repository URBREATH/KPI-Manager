<script setup>
import LocationPicker from './LocationPicker.vue'
const props = defineProps({
  modelValue: Object
})

const emit = defineEmits(['update:modelValue'])
const themes = [
  'agriculture',
  'economy',
  'education',
  'environment',
  'energy',
  'government',
  'health',
  'justice',
  'international',
  'regions',
  'society',
  'technology',
  'transportation'
]
function updateField(field, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}
</script>

<template>
  <v-layout>
    <v-main :class="containerState"  >
       <v-card
        class="pt-0 mb-2 px-3"
        ref="mainContainerDefinition"
        id="main-container-definition"
        flat
      >
  <v-row dense>
  
  <!-- LEFT COLUMN -->
  <v-col cols="12" md="6">
    
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
      :label="$t('labels.frequency')"
      :model-value="modelValue.frequency"
      @update:model-value="v => updateField('frequency', v)"
    />

    <v-select
      :label="$t('labels.theme')"
      :items="themes.map(theme => ({ title: $t(`themes.${theme}`), value: theme }))"
      item-title="title"
      item-value="value"
      multiple
      chips
      closable-chips
      :model-value="modelValue.theme || []"
      @update:model-value="v => updateField('theme', v)"
    />

  </v-col>

  <!-- RIGHT COLUMN -->
  <v-col cols="12" md="6">

    <v-text-field
      :label="$t('labels.publisher')"
      :model-value="modelValue.publisher"
      @update:model-value="v => updateField('publisher', v)"
    />

    <v-combobox
      v-model="tags"
      :items="[]" 
      :label="$t('labels.customTags')"
      multiple
      chips
      closable-chips
      hide-no-data
      :menu-icon="null"
      :placeholder="$t('strings.tagsPlaceholder')"
      @keydown.enter.prevent
      :model-value="modelValue.keyword"
      @update:model-value="v => updateField('keyword', v)"
    />
    <div class="field-block">
      <div class="field-label">{{ $t('labels.location') }}</div>

      <div class="map-box">
        <LocationPicker
          :model-value="modelValue.spatial"
          @update:model-value="v => updateField('spatial', v)"
        />
      </div>
    </div>

  </v-col>



</v-row>
</v-card>
  </v-main>
</v-layout>
</template>