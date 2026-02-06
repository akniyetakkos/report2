<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div class="row items-center">
            <q-icon name="location_on" size="sm" class="q-mr-sm" />
            WebCheckIn
          </div>
        </q-toolbar-title>
        <q-chip v-if="checkInStore.isCheckedIn" color="positive" text-color="white" dense icon="check_circle">
          На работе
        </q-chip>

        <q-btn flat round dense icon="more_vert">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item clickable v-close-popup @click="showHistory = true">
                <q-item-section avatar>
                  <q-icon name="history" />
                </q-item-section>
                <q-item-section>История</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="showSettings = true">
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>Настройки</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="handleRefresh">
                <q-item-section avatar>
                  <q-icon name="refresh" />
                </q-item-section>
                <q-item-section>Обновить</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="showAbout = true">
                <q-item-section avatar>
                  <q-icon name="info" />
                </q-item-section>
                <q-item-section>О приложении</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="$router.push('/admin/login')">
                <q-item-section avatar>
                  <q-icon name="admin_panel_settings" />
                </q-item-section>
                <q-item-section>Админ панель</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-dialog v-model="showHistory">
      <q-card style="min-width: 350px; max-width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">История регистраций</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-list separator>
            <q-item v-if="!historyRecords.length">
              <q-item-section>
                <div class="text-center text-grey-7">
                  <q-icon name="inbox" size="lg" />
                  <div class="q-mt-sm">Нет записей</div>
                </div>
              </q-item-section>
            </q-item>

            <q-item v-for="record in historyRecords" :key="record.id">
              <q-item-section avatar>
                <q-avatar :color="record.type === 'check_in' ? 'positive' : 'negative'" text-color="white"
                  :icon="record.type === 'check_in' ? 'login' : 'logout'" />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ record.locationName }}</q-item-label>
                <q-item-label caption>
                  {{ formatDateTime(record.timestamp) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge :color="record.type === 'check_in' ? 'positive' : 'negative'"
                  :label="record.type === 'check_in' ? 'Вход' : 'Выход'" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Настройки Dialog -->
    <q-dialog v-model="showSettings">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Настройки</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>Показывать координаты</q-item-label>
                <q-item-label caption>
                  Отображать координаты при регистрации
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="settings.showCoordinates" />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Высокая точность GPS</q-item-label>
                <q-item-label caption>
                  Использовать максимальную точность (больше батареи)
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="settings.highAccuracy" />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Уведомления</q-item-label>
                <q-item-label caption>
                  Показывать push-уведомления
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="settings.notifications" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Сохранить" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAbout">
      <q-card style="min-width: 350px">
        <q-card-section class="text-center">
          <q-icon name="location_on" size="64px" color="primary" />
          <div class="text-h6 q-mt-md">WebCheckIn</div>
          <div class="text-caption text-grey-7">Версия 1.0.0</div>
        </q-card-section>

        <q-card-section>
          <p class="text-body2">
            Система геолокационной регистрации рабочего времени с интеграцией в Elpass.
          </p>
          <p class="text-caption text-grey-7">
            © 2024 WebCheckIn. Все права защищены.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Закрыть" color="primary" flat v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useCheckInStore } from '../stores/checkInStore'
import { getHistory } from '../services/api/elpass'

const checkInStore = useCheckInStore()

const showHistory = ref(false)
const showSettings = ref(false)
const showAbout = ref(false)
const historyRecords = ref([])

const settings = ref({
  showCoordinates: false,
  highAccuracy: true,
  notifications: true
})

async function loadHistory() {
  try {
    const result = await getHistory()
    historyRecords.value = result.data
  } catch (error) {
    console.error('Failed to load history:', error)
  }
}
function handleRefresh() {
  window.location.reload()
}

function formatDateTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

import { watch } from 'vue'
watch(showHistory, (newVal) => {
  if (newVal) {
    loadHistory()
  }
})
</script>

<style scoped></style>