<template>
  <q-page class="check-in-page">
    <div class="map-wrapper">
      <MapView :latitude="position?.latitude" :longitude="position?.longitude" :accuracy="position?.accuracy"
        :loading="geoLoading" @map-ready="onMapReady" />
    </div>

    <div class="control-panel">
      <q-card class="control-card">
        <q-card-section>
          <div v-if="geoLoading" class="text-center q-mb-md">
            <q-spinner color="primary" size="40px" />
            <div class="q-mt-sm text-grey-7">Определение местоположения...</div>
          </div>

          <div v-else-if="geoError" class="q-mb-md">
            <q-banner class="bg-negative text-white" dense rounded>
              <template v-slot:avatar>
                <q-icon name="error" />
              </template>
              {{ geoError }}
              <template v-slot:action>
                <q-btn flat label="Повторить" @click="refreshGeo" color="white" />
              </template>
            </q-banner>
          </div>

          <CheckInButton :user-position="position" :geo-loading="geoLoading" @checkin-success="onCheckInSuccess"
            @checkout-success="onCheckOutSuccess" />

          <div v-if="position" class="q-mt-md">
            <q-separator class="q-mb-md" />

            <div class="info-grid">
              <div class="info-item">
                <q-icon name="schedule" color="grey-7" size="sm" />
                <span class="text-caption text-grey-7 q-ml-sm">
                  {{ currentTime }}
                </span>
              </div>

              <div v-if="position.accuracy" class="info-item">
                <q-icon name="gps_fixed" color="grey-7" size="sm" />
                <span class="text-caption text-grey-7 q-ml-sm">
                  Точность: {{ Math.round(position.accuracy) }}м
                </span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <CheckInSummary v-model="showSummary" :type="summaryType" :data="summaryData" :show-coordinates="false"
      @confirm="onSummaryConfirm" />

    <q-banner v-if="!isOnline" class="bg-warning text-white fixed-bottom" dense>
      <template v-slot:avatar>
        <q-icon name="cloud_off" />
      </template>
      Нет подключения к интернету
    </q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import MapView from '../components/map/MapView.vue'
import CheckInButton from '../components/checkin/CheckInButton.vue'
import CheckInSummary from '../components/checkin/CheckInSummary.vue'
import { useGeolocation } from '../composables/useGeolocation'
import { useCheckInStore } from '../stores/checkInStore'

const checkInStore = useCheckInStore()

const {
  position,
  error: geoError,
  loading: geoLoading,
  refresh: refreshGeo
} = useGeolocation()

const isOnline = ref(navigator.onLine)
const currentTime = ref('')
const showSummary = ref(false)
const summaryType = ref('check_in')
const summaryData = ref({})

let timeInterval = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  checkInStore.fetchStatus().catch(err => {
    console.error('Failed to fetch status:', err)
  })
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function handleOnline() {
  isOnline.value = true
}

function handleOffline() {
  isOnline.value = false
}

function onMapReady(map) {
  console.log('Map ready:', map)
}

function onCheckInSuccess(result) {
  summaryType.value = 'check_in'
  summaryData.value = result
  showSummary.value = true
}

function onCheckOutSuccess(result) {
  summaryType.value = 'check_out'
  summaryData.value = {
    ...result,
    checkInTime: checkInStore.lastCheckIn?.timestamp
  }
  showSummary.value = true
}

function onSummaryConfirm() {
  console.log('Summary confirmed')
}
</script>

<style scoped>
.check-in-page {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.control-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px;
  pointer-events: none;
}

.control-card {
  pointer-events: all;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 16px 16px 0 0;
}

.info-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
}

@media (min-width: 600px) {
  .control-panel {
    left: auto;
    right: 16px;
    bottom: 16px;
    max-width: 400px;
  }

  .control-card {
    border-radius: 16px;
  }
}
</style>