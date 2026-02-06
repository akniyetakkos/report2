import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from 'src/services/api/adminApi'

export const useLocationStore = defineStore('location', () => {
  const locations = ref([])
  const loading = ref(false)
  const error = ref(null)
  const activeLocations = computed(() =>
    locations.value.filter((loc) => loc.active !== false)
  )

  async function fetchLocations() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/locations')
      locations.value = response.data || []
      return locations.value
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки локаций'
      throw err
    } finally {
      loading.value = false
    }
  }

  function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000 // радиус Земли в метрах
    const toRad = (value) => (value * Math.PI) / 180

    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c)
  }

  function findNearestLocation(lat, lng) {
    if (!activeLocations.value.length) return null

    let nearest = null
    let minDistance = Infinity

    activeLocations.value.forEach((location) => {
      const distance = getDistance(lat, lng, location.lat, location.lng)

      if (distance <= (location.radius || 0) && distance < minDistance) {
        minDistance = distance
        nearest = {
          ...location,
          distance
        }
      }
    })

    return nearest
  }

  return {
    locations,
    activeLocations,
    loading,
    error,
    fetchLocations,
    getDistance,
    findNearestLocation
  }
})


