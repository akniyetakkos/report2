import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from 'src/services/api/adminApi'

export const useAdminLocationStore = defineStore('adminLocation', () => {
  const locations = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchLocations() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/locations')
      locations.value = response.data
      return locations.value
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки локаций'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createLocation(locationData) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/locations', locationData)
      locations.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message || 'Ошибка при создания локации'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateLocation(id, updates) {
    loading.value = true
    error.value = null

    try {
      const response = await api.put(`/locations/${id}`, updates)
      const index = locations.value.findIndex(loc => loc.id === id)

      if (index !== -1) {
        locations.value[index] = response.data
      }

      return response.data
    } catch (err) {
      error.value = err.message || 'Ошибка обновления локации'
      throw err
    } finally {
      loading.value = false
    }
  }
  async function deleteLocation(id) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/locations/${id}`)
      locations.value = locations.value.filter(loc => loc.id !== id)
      return true
    } catch (err) {
      error.value = err.message || 'Ошибка удаления локации'
      throw err
    } finally {
      loading.value = false
    }
  }

  function getLocationById(id) {
    return locations.value.find(loc => loc.id === id)
  }

  return {
    locations,
    loading,
    error,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    getLocationById
  }
})
