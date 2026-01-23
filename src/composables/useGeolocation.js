import { ref, onMounted, onUnmounted } from 'vue'

export function useGeolocation() {
  const position = ref(null)
  const error = ref(null)
  const loading = ref(true)
  const permissionDenied = ref(false)
  
  let watchId = null

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }

  const onSuccess = (pos) => {
    loading.value = false
    position.value = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp
    }
    error.value = null
    permissionDenied.value = false
  }

  const onError = (err) => {
    loading.value = false
    console.error('Geolocation error:', err)
    
    switch(err.code) {
      case err.PERMISSION_DENIED:
        permissionDenied.value = true
        error.value = 'Доступ к геолокации запрещён. Разрешите доступ в настройках браузера.'
        break
      case err.POSITION_UNAVAILABLE:
        error.value = 'Информация о местоположении недоступна.'
        break
      case err.TIMEOUT:
        error.value = 'Превышено время ожидания определения местоположения.'
        break
      default:
        error.value = 'Произошла неизвестная ошибка при определении местоположения.'
    }
  }

  const startWatching = () => {
    if (!('geolocation' in navigator)) {
      error.value = 'Ваш браузер не поддерживает геолокацию.'
      loading.value = false
      return
    }

    loading.value = true
    
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
    watchId = navigator.geolocation.watchPosition(onSuccess, onError, options)
  }

  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
  }

  const refresh = () => {
    loading.value = true
    error.value = null
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
  }

  onMounted(() => {
    startWatching()
  })

  onUnmounted(() => {
    stopWatching()
  })

  return {
    position,
    error,
    loading,
    permissionDenied,
    refresh,
    startWatching,
    stopWatching
  }
}