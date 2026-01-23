import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLocationStore = defineStore('location', () => {
  const workLocations = ref([
    {
      id: 1,
      name: 'Офис - Главный',
      address: 'Syganak street, 17/10, Astana, 010000, Kazakhstan',
      lat: 51.091944,
      lng: 71.415556,
      radius: 100, 
      active: true
    },
  ])


  const activeLocations = computed(() => 
    workLocations.value.filter(loc => loc.active)
  )

  function isWithinRadius(userLat, userLng, location) {
    const R = 6371e3 
    const φ1 = userLat * Math.PI / 180
    const φ2 = location.lat * Math.PI / 180
    const Δφ = (location.lat - userLat) * Math.PI / 180
    const Δλ = (location.lng - userLng) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance <= location.radius
  }

  function findNearestLocation(userLat, userLng) {
    const nearby = activeLocations.value.filter(location => 
      isWithinRadius(userLat, userLng, location)
    )

    if (nearby.length === 0) return null

    return nearby.reduce((nearest, location) => {
      const dist = getDistance(userLat, userLng, location.lat, location.lng)
      const nearestDist = getDistance(userLat, userLng, nearest.lat, nearest.lng)
      return dist < nearestDist ? location : nearest
    })
  }

  function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  function addLocation(location) {
    const newLocation = {
      id: Date.now(),
      ...location,
      active: true
    }
    workLocations.value.push(newLocation)
    return newLocation
  }

  return {
    workLocations,
    activeLocations,
    isWithinRadius,
    findNearestLocation,
    getDistance,
    addLocation
  }
})