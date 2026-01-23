import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { checkIn, checkOut, getStatus } from '../services/api/elpass'

export const useCheckInStore = defineStore('checkIn', () => {
  const status = ref('idle') 
  const currentLocation = ref(null)
  const lastCheckIn = ref(null)
  const lastCheckOut = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isCheckedIn = computed(() => status.value === 'checked_in')
  const canCheckIn = computed(() => status.value === 'idle' || status.value === 'checked_out')
  const canCheckOut = computed(() => status.value === 'checked_in')
  async function performCheckIn(latitude, longitude, locationName = 'Рабочая точка') {
    if (!canCheckIn.value) {
      throw new Error('Вы уже зарегистрированы')
    }

    loading.value = true
    error.value = null

    try {
      const result = await checkIn({
        lat: latitude,
        lng: longitude,
        timestamp: new Date().toISOString(),
        locationName
      })

      status.value = 'checked_in'
      currentLocation.value = locationName
      lastCheckIn.value = {
        ...result,
        timestamp: new Date().toISOString(),
        lat: latitude,
        lng: longitude,
        locationName
      }

      return lastCheckIn.value
    } catch (err) {
      error.value = err.message || 'Ошибка при регистрации входа'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function performCheckOut(latitude, longitude, locationName = 'Рабочая точка') {
    if (!canCheckOut.value) {
      throw new Error('Вы не зарегистрированы на работе')
    }

    loading.value = true
    error.value = null

    try {
      const result = await checkOut({
        lat: latitude,
        lng: longitude,
        timestamp: new Date().toISOString(),
        locationName
      })

      status.value = 'checked_out'
      lastCheckOut.value = {
        ...result,
        timestamp: new Date().toISOString(),
        lat: latitude,
        lng: longitude,
        locationName
      }

      return lastCheckOut.value
    } catch (err) {
      error.value = err.message || 'Ошибка при регистрации выхода'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchStatus() {
    loading.value = true
    try {
      const result = await getStatus()
      status.value = result.status
      currentLocation.value = result.location
      if (result.lastCheckIn) {
        lastCheckIn.value = result.lastCheckIn
      }
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function reset() {
    status.value = 'idle'
    currentLocation.value = null
    lastCheckIn.value = null
    lastCheckOut.value = null
    error.value = null
  }

  return {
    status,
    currentLocation,
    lastCheckIn,
    lastCheckOut,
    loading,
    error,
    
    isCheckedIn,
    canCheckIn,
    canCheckOut,
    
    performCheckIn,
    performCheckOut,
    fetchStatus,
    reset
  }
})