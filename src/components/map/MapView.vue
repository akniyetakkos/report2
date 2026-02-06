<template>
    <div class="map-container">
        <div ref="mapContainer" class="map-view"></div>
        <q-btn round color="primary" icon="my_location" class="center-btn" @click="centerOnUser" :loading="loading">
            <q-tooltip>Центрировать на мне</q-tooltip>
        </q-btn>

        <div v-if="accuracy" class="accuracy-badge">
            <q-chip dense color="info" text-color="white" icon="gps_fixed">
                Точность: {{ Math.round(accuracy) }}м
            </q-chip>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLocationStore } from '../../stores/locationStore'
const props = defineProps({
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    loading: Boolean
})

const emit = defineEmits(['map-ready'])

const mapContainer = ref(null)
const locationStore = useLocationStore()

let map = null
let userMarker = null
let accuracyCircle = null
let locationMarkers = []
let locationCircles = []
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

onMounted(() => {
    initMap()
    locationStore.fetchLocations()
        .then(() => {
            drawWorkLocations()
        })
        .catch((err) => {
            console.error('Failed to load locations for map:', err)
        })
})

onUnmounted(() => {
    if (map) {
        map.remove()
    }
})

function initMap() {
    const defaultLat = props.latitude || 51.1694
    const defaultLng = props.longitude || 71.4491

    map = L.map(mapContainer.value, {
        center: [defaultLat, defaultLng],
        zoom: 15,
        zoomControl: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map)

    emit('map-ready', map)
}

function updateUserPosition(lat, lng, accuracy) {
    if (!map) return

    const position = [lat, lng]

    if (userMarker) {
        userMarker.setLatLng(position)
    } else {
        const userIcon = L.divIcon({
            className: 'user-marker',
            html: '<div class="pulse"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })

        userMarker = L.marker(position, { icon: userIcon }).addTo(map)
        userMarker.bindPopup('Вы здесь')
    }

    if (accuracyCircle) {
        accuracyCircle.setLatLng(position)
        accuracyCircle.setRadius(accuracy)
    } else {
        accuracyCircle = L.circle(position, {
            radius: accuracy,
            color: '#4285f4',
            fillColor: '#4285f4',
            fillOpacity: 0.1,
            weight: 2
        }).addTo(map)
    }
}

function drawWorkLocations() {
    if (!map) return

    locationMarkers.forEach(m => m.remove())
    locationCircles.forEach(c => c.remove())
    locationMarkers = []
    locationCircles = []

    const locations =
        (locationStore.activeLocations && locationStore.activeLocations.value) ||
        (locationStore.locations && locationStore.locations.value) ||
        []

    locations.forEach(location => {
        const position = [location.lat, location.lng]

        const circle = L.circle(position, {
            radius: location.radius,
            color: '#34a853',
            fillColor: '#34a853',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '5, 10'
        }).addTo(map)

        circle.bindPopup(`
      <div style="text-align: center;">
        <strong>${location.name}</strong><br>
        ${location.address}<br>
        <small>Радиус: ${location.radius}м</small>
      </div>
    `)

        locationCircles.push(circle)

        const workIcon = L.divIcon({
            className: 'work-marker',
            html: `<div class="work-icon">🏢</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        })

        const marker = L.marker(position, { icon: workIcon }).addTo(map)
        marker.bindPopup(`
      <div style="text-align: center;">
        <strong>${location.name}</strong><br>
        ${location.address}
      </div>
    `)

        locationMarkers.push(marker)
    })
}

function centerOnUser() {
    if (map && props.latitude && props.longitude) {
        map.setView([props.latitude, props.longitude], 17, {
            animate: true,
            duration: 0.5
        })
    }
}

watch(() => [props.latitude, props.longitude, props.accuracy], ([lat, lng, acc]) => {
    if (lat && lng) {
        updateUserPosition(lat, lng, acc || 50)
    }
})

defineExpose({
    centerOnUser,
    map
})
</script>

<style scoped>
.map-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.map-view {
    width: 100%;
    height: 100%;
}

.center-btn {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}

.accuracy-badge {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 1000;
}

:deep(.user-marker) {
    background: none;
    border: none;
}

:deep(.pulse) {
    width: 20px;
    height: 20px;
    background: #4285f4;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7);
    }

    50% {
        box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
    }
}

:deep(.work-marker) {
    background: none;
    border: none;
}

:deep(.work-icon) {
    font-size: 24px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>