<template>
    <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
    locations: {
        type: Array,
        default: () => []
    },
    selectedLocation: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['location-clicked', 'marker-clicked'])

const mapContainer = ref(null)
let map = null
const markers = new Map()
const circles = new Map()

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

const selectedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const defaultIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const inactiveIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const initMap = () => {
    map = L.map(mapContainer.value, {
        center: [51.1282, 71.4306],
        zoom: 12,
        zoomControl: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map)

    map.on('click', (e) => {
        emit('location-clicked', {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        })
    })
}

const addLocationMarkers = () => {
    markers.forEach(marker => map.removeLayer(marker))
    circles.forEach(circle => map.removeLayer(circle))
    markers.clear()
    circles.clear()

    props.locations.forEach(location => {
        const isSelected = props.selectedLocation?.id === location.id
        const icon = isSelected ? selectedIcon : (location.active ? defaultIcon : inactiveIcon)

        const marker = L.marker([location.lat, location.lng], { icon })
            .addTo(map)
            .bindPopup(`
        <div style="text-align: center;">
          <strong>${location.name}</strong><br>
          ${location.address}<br>
          <small>Радиус: ${location.radius}м</small><br>
          <small style="color: ${location.active ? 'green' : 'red'}">
            ${location.active ? 'Активна' : 'Неактивна'}
          </small>
        </div>
      `)
            .on('click', () => {
                emit('marker-clicked', location)
            })

        markers.set(location.id, marker)

        const circle = L.circle([location.lat, location.lng], {
            radius: location.radius,
            color: isSelected ? '#f56c6c' : (location.active ? '#409eff' : '#909399'),
            fillColor: isSelected ? '#f56c6c' : (location.active ? '#409eff' : '#909399'),
            fillOpacity: 0.1,
            weight: isSelected ? 2 : 1
        }).addTo(map)

        circles.set(location.id, circle)
    })

    if (props.locations.length > 0) {
        const bounds = L.latLngBounds(
            props.locations.map(loc => [loc.lat, loc.lng])
        )
        map.fitBounds(bounds, { padding: [50, 50] })
    }
}

const updateSelectedMarker = () => {
    props.locations.forEach(location => {
        const marker = markers.get(location.id)
        const circle = circles.get(location.id)
        const isSelected = props.selectedLocation?.id === location.id

        if (marker) {
            const icon = isSelected ? selectedIcon : (location.active ? defaultIcon : inactiveIcon)
            marker.setIcon(icon)

            if (isSelected) {
                marker.openPopup()
                map.panTo([location.lat, location.lng])
            }
        }

        if (circle) {
            circle.setStyle({
                color: isSelected ? '#f56c6c' : (location.active ? '#409eff' : '#909399'),
                fillColor: isSelected ? '#f56c6c' : (location.active ? '#409eff' : '#909399'),
                weight: isSelected ? 2 : 1
            })
        }
    })
}

onMounted(() => {
    initMap()
    addLocationMarkers()
})

watch(() => props.locations, () => {
    if (map) {
        addLocationMarkers()
    }
}, { deep: true })

watch(() => props.selectedLocation, () => {
    if (map) {
        updateSelectedMarker()
    }
}, { deep: true })
</script>

<style scoped>
.map-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
}
</style>