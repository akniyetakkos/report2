<template>
  <q-page class="check-in-page row no-wrap">
    <!-- Левая часть: карта -->
    <div class="map-wrapper col">
      <MapView
        :latitude="position?.latitude"
        :longitude="position?.longitude"
        :accuracy="position?.accuracy"
        :loading="geoLoading"
        @map-ready="onMapReady"
      />
    </div>

    <!-- Правая часть: панель управления -->
    <div class="side-panel col-auto">
      <div class="side-panel-inner">
        <!-- Верхний блок с временем и статусом -->
        <q-card class="status-card">
          <q-card-section class="status-header">
            <div class="status-time">
              <div class="status-time-label">Сейчас</div>
              <div class="status-time-value">
                {{ currentTime }}
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div v-if="geoLoading" class="text-center q-mb-md">
              <q-spinner color="primary" size="40px" />
              <div class="q-mt-sm text-grey-7">Определение местоположения...</div>
            </div>

            <div v-else-if="geoError" class="q-mb-md">
              <q-banner class="bg-negative text-white" dense rounded>
                <template #avatar>
                  <q-icon name="error" />
                </template>
                {{ geoError }}
                <template #action>
                  <q-btn flat label="Повторить" @click="refreshGeo" color="white" />
                </template>
              </q-banner>
            </div>

            <!-- Сообщение о геозоне / оффлайне -->
            <div v-if="!geoLoading" class="q-mb-md">
              <q-banner
                v-if="!isOnline"
                class="bg-warning text-white"
                rounded
                dense
              >
                <template #avatar>
                  <q-icon name="cloud_off" />
                </template>
                Нет подключения к интернету
              </q-banner>

              
            </div>

            <!-- Кнопка чек-ина (логика не меняется) -->
            <CheckInButton
              :user-position="position"
              :geo-loading="geoLoading"
              @checkin-success="onCheckInSuccess"
              @checkout-success="onCheckOutSuccess"
            />

            <!-- Информация о точности -->
            <div v-if="position" class="q-mt-md">
              <q-separator class="q-mb-md" />

              <div class="info-grid">
                <div class="info-item">
                  <q-icon name="schedule" color="grey-7" size="sm" />
                  <span class="text-caption text-grey-7 q-ml-sm">
                    Время устройства: {{ currentTime }}
                  </span>
                </div>

                <div v-if="position.accuracy" class="info-item">
                  <q-icon name="gps_fixed" color="grey-7" size="sm" />
                  <span class="text-caption text-grey-7 q-ml-sm">
                    Точность: {{ Math.round(position.accuracy) }} м
                  </span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- История активности / профиль (простая имитация под дизайн) -->
        <q-card class="activity-card q-mt-md">
          <q-card-section>
            <div class="activity-header">
              <span class="text-subtitle2 text-grey-8">История активности</span>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="activity-item">
              <q-icon name="check_circle" color="positive" size="sm" />
              <div class="activity-text">
                <div class="activity-title">Вход в систему</div>
                <div class="activity-subtitle text-caption text-grey-6">
                  Сегодня, 09:00
                </div>
              </div>
            </div>
            <div class="activity-item">
              <q-icon name="logout" color="grey-5" size="sm" />
              <div class="activity-text">
                <div class="activity-title">Выход</div>
                <div class="activity-subtitle text-caption text-grey-6">
                  Вчера, 18:05
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

      
      </div>
    </div>

    <CheckInSummary
      v-model="showSummary"
      :type="summaryType"
      :data="summaryData"
      :show-coordinates="false"
      @confirm="onSummaryConfirm"
    />
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
  height: 100vh;
  background: #f3f6fb;
}

.map-wrapper {
  position: relative;
  height: 100%;
}

.side-panel {
  width: 360px;
  max-width: 100%;
  background: #f5f7fb;
  box-shadow: -8px 0 24px rgba(15, 35, 52, 0.06);
  display: flex;
  justify-content: center;
}

.side-panel-inner {
  width: 100%;
  max-width: 360px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
}

.status-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 35, 52, 0.08);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-time-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9aa5b5;
}

.status-time-value {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.1;
  margin-top: 4px;
}

.zone-banner {
  border-left: 4px solid #ff9800;
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

.activity-card {
  border-radius: 16px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.activity-item:last-child {
  margin-bottom: 0;
}

.activity-title {
  font-size: 13px;
}

.activity-text {
  display: flex;
  flex-direction: column;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 10px 8px;
  border-radius: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-info {
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .check-in-page {
    flex-direction: column;
  }

  .side-panel {
    width: 100%;
    box-shadow: 0 -8px 24px rgba(15, 35, 52, 0.12);
  }

  .side-panel-inner {
    max-width: 480px;
    margin: 0 auto;
  }

  .map-wrapper {
    height: 50%;
  }
}
</style>