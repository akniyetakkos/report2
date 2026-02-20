<template>
    <div ref="mapContainer" class="map-preview-container"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
    lat: {
        type: Number,
        default: null
    },
    lng: {
        type: Number,
        default: null
    }
})

const emit = defineEmits(['map-clicked'])

const mapContainer = ref(null)
let map = null
let marker = null

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

const markerIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const initMap = () => {
    if (!mapContainer.value) return

    map = L.map(mapContainer.value, {
        center: props.lat && props.lng ? [props.lat, props.lng] : [51.1282, 71.4306],
        zoom: props.lat && props.lng ? 15 : 12,
        zoomControl: false
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map)

    map.on('click', (e) => {
        emit('map-clicked', {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        })
    })

    if (props.lat && props.lng) {
        updateMarker()
    }
}

const updateMarker = () => {
    if (!map) return

    if (marker) {
        map.removeLayer(marker)
    }

    if (props.lat && props.lng) {
        marker = L.marker([props.lat, props.lng], { icon: markerIcon })
            .addTo(map)
        map.setView([props.lat, props.lng], 15)
    }
}

onMounted(() => {
    initMap()
})

watch(() => [props.lat, props.lng], () => {
    if (map) {
        updateMarker()
    }
})
</script>

<style scoped>
.map-preview-container {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e0e0e0;
}
</style>

