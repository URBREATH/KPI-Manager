<script setup>
import { ref, computed } from 'vue'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix icone marker con Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

// Props: GeoJSON Point array
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

// Centro iniziale della mappa (Roma)
const defaultCenter = [41.9028, 12.4964]

// Posizione del marker in formato Leaflet [lat, lng]
const position = ref(null)

// Se arriva uno spatial già valorizzato
if (
  Array.isArray(props.modelValue) &&
  props.modelValue.length > 0 &&
  props.modelValue[0].type === 'Point'
) {
  const [lng, lat] = props.modelValue[0].coordinates
  position.value = [lat, lng]
}

// Verifica se il marker può essere visualizzato
const hasPosition = computed(() => {
  return (
    Array.isArray(position.value) &&
    position.value.length === 2
  )
})

// Click sulla mappa
function onMapClick(event) {
  const { lat, lng } = event.latlng

  // aggiorno marker locale
  position.value = [lat, lng]

  // emetto GeoJSON per il padre
  emit('update:modelValue', [
    {
      type: 'Point',
      coordinates: [
        lng, // GeoJSON vuole prima longitude
        lat  // poi latitude
      ]
    }
  ])
}
</script>

<template>
  <div class="map-wrapper">
    <LMap
      :zoom="6"
      :center="hasPosition ? position : defaultCenter"
      style="height: 100%; width: 100%;"
      @click="onMapClick"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LMarker
        v-if="hasPosition"
        :lat-lng="position"
      />
    </LMap>
  </div>
</template>

<style scoped>
.map-wrapper {
  height: 300px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}
</style>