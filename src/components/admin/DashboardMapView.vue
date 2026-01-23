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
    activeEmployees: {
        type: Array,
        default: () => []
    }
})

const mapContainer = ref(null)
let map = null
const markers = new Map()

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

const locationIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const activeIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
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
}

const addMarkers = () => {
    markers.forEach(marker => map.removeLayer(marker))
    markers.clear()

    props.locations.forEach(location => {
        const activeCount = props.activeEmployees.filter(
            emp => emp.locationName === location.name
        ).length

        const icon = activeCount > 0 ? activeIcon : locationIcon

        const marker = L.marker([location.lat, location.lng], { icon })
            .addTo(map)

        const activeAtLocation = props.activeEmployees.filter(
            emp => emp.locationName === location.name
        )

        let popupContent = `
      <div style="text-align: center;">
        <strong>${location.name}</strong><br>
        ${location.address}<br>
        <small>Радиус: ${location.radius}м</small>
    `

        if (activeAtLocation.length > 0) {
            popupContent += `<hr style="margin: 8px 0;">
        <div style="color: green; font-weight: bold;">
          Активных сотрудников: ${activeAtLocation.length}
        </div>
        <ul style="text-align: left; margin: 4px 0; padding-left: 20px;">
      `
            activeAtLocation.forEach(emp => {
                popupContent += `<li>${emp.employeeName}</li>`
            })
            popupContent += '</ul>'
        }

        popupContent += '</div>'

        marker.bindPopup(popupContent)
        markers.set(location.id, marker)

        L.circle([location.lat, location.lng], {
            radius: location.radius,
            color: activeCount > 0 ? '#4caf50' : '#2196f3',
            fillColor: activeCount > 0 ? '#4caf50' : '#2196f3',
            fillOpacity: 0.1,
            weight: 1
        }).addTo(map)
    })

    if (props.locations.length > 0) {
        const bounds = L.latLngBounds(
            props.locations.map(loc => [loc.lat, loc.lng])
        )
        map.fitBounds(bounds, { padding: [50, 50] })
    }
}

onMounted(() => {
    initMap()
    addMarkers()
})

watch(() => [props.locations, props.activeEmployees], () => {
    if (map) {
        addMarkers()
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