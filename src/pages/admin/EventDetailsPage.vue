<template>
  <q-page padding>
    <div class="q-mb-md">
      <div class="row items-center q-col-gutter-md">
        <div class="col-auto">
          <q-btn flat round dense icon="arrow_back" @click="goBack" />
        </div>
        <div class="col">
          <div class="text-caption text-grey-6">
            Журнал событий / Подробности
          </div>
          <div class="text-h6">
            Событие №{{ eventId }}<span v-if="employeeName">: {{ employeeName }}</span>
          </div>
        </div>
        <div class="col-auto">
          <q-btn flat color="negative" class="q-mr-sm">
            Удалить запись
          </q-btn>
          <q-btn color="primary">
            Редактировать
          </q-btn>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-8">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 q-mb-md">
              Основная информация
            </div>
            <div class="row items-center q-col-gutter-md">
              <div class="col-auto">
                <q-avatar size="64px" color="primary" text-color="white">
                  {{ initials }}
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle2 text-grey-7 q-mb-xs">
                  Событие №{{ eventId }}
                </div>
                <div class="text-h6">
                  {{ event?.employeeName || 'Неизвестный сотрудник' }}
                </div>
                <div class="text-caption text-grey-7">
                  {{ employeePosition }}<span v-if="employeeId"> | ID: {{ employeeId }}</span>
                </div>
              </div>
              <div class="col-auto">
                <q-chip
                  v-if="event"
                  :color="event.type === 'check_in' ? 'green' : 'orange'"
                  text-color="white"
                  class="text-uppercase"
                >
                  {{ event.type === 'check_in' ? 'Вход' : 'Выход' }}
                </q-chip>
              </div>
            </div>
          </q-card-section>

          <q-separator inset />

          <q-card-section v-if="event">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-7 q-mb-xs">
                  Рабочая точка
                </div>
                <div class="text-body1">
                  {{ event.locationName }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ locationAddress }}
                </div>
              </div>

              <div class="col-12 col-md-3">
                <div class="text-caption text-grey-7 q-mb-xs">
                  Дата и время события
                </div>
                <div class="text-body1">
                  {{ formattedDateTime }}
                </div>
              </div>

              <div class="col-12 col-md-3" v-if="shiftDuration">
                <div class="text-caption text-grey-7 q-mb-xs">
                  Длительность смены
                </div>
                <div class="text-body1">
                  {{ shiftDuration }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-subtitle1">
                  Другие события за {{ dayTitle }}
                </div>
              </div>
              <div class="col-auto" v-if="employeeName">
                <div class="text-caption text-grey-6">
                  {{ employeeName }}
                </div>
              </div>
            </div>

            <q-markup-table v-if="otherEvents.length" flat>
              <thead>
                <tr>
                  <th class="text-left">Время</th>
                  <th class="text-left">Тип события</th>
                  <th class="text-left">Точка</th>
                  <th class="text-left">Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in otherEvents" :key="e.id">
                  <td>{{ formatTime(e.timestamp) }}</td>
                  <td>{{ e.type === 'check_in' ? 'Вход' : 'Выход' }}</td>
                  <td>{{ e.locationName }}</td>
                  <td>
                    <q-chip
                      :color="e.type === 'check_in' ? 'green' : 'orange'"
                      text-color="white"
                      size="sm"
                      outline
                    >
                      {{ e.type === 'check_in' ? 'ПРИБЫЛ' : 'ВЫХОД' }}
                    </q-chip>
                  </td>
                </tr>
              </tbody>
            </q-markup-table>

            <div v-else class="text-caption text-grey-6">
              Других событий за этот день нет.
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1 q-mb-md">
              Геолокация
            </div>

            <div v-if="event">
              <div class="q-mb-sm">
                <div class="text-caption text-grey-7">
                  Координаты
                </div>
                <div class="text-body2">
                  {{ event.lat?.toFixed(6) }}, {{ event.lng?.toFixed(6) }}
                </div>
              </div>

              <div class="q-mb-sm">
                <div class="text-caption text-grey-7">
                  Рабочая точка
                </div>
                <div class="text-body2">
                  {{ event.locationName }}
                </div>
              </div>

              <div class="text-caption text-grey-6">
                Карта не обязательна, поэтому здесь только текстовая информация о геопозиции.
              </div>
            </div>

            <div v-else class="text-caption text-grey-6">
              Событие не найдено.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminEventsStore } from 'src/stores/adminEventsStore'
import { useEmployeesStore } from 'src/stores/employeesStore'
import { useAdminLocationStore } from 'src/stores/adminLocationStore'

const route = useRoute()
const router = useRouter()
const eventsStore = useAdminEventsStore()
const employeesStore = useEmployeesStore()
const locationStore = useAdminLocationStore()

const eventId = computed(() => Number(route.params.id))

onMounted(async () => {
  // На всякий случай подгружаем данные, если где-то ещё не загружены
  try {
    await Promise.all([
      eventsStore.fetchEvents(),
      employeesStore.fetchEmployees(),
      locationStore.fetchLocations()
    ])
  } catch (err) {
    console.error('Failed to preload data for event details:', err)
  }

  if (!event.value) {
    // Если события нет, возвращаемся в журнал
    router.replace({ name: 'admin-events' })
  }
})

const event = computed(() => eventsStore.getEventById(eventId.value))

const employee = computed(() =>
  employeesStore.employees.find((e) => e.id === event.value?.employeeId)
)

const employeeName = computed(() => event.value?.employeeName || employee.value?.name || '')
const employeePosition = computed(() => employee.value?.position || 'Сотрудник')
const employeeId = computed(() => event.value?.employeeId || employee.value?.id || null)

const initials = computed(() => {
  const name = employeeName.value
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
})

const location = computed(() =>
  locationStore.locations.find((l) => l.id === event.value?.locationId)
)

const locationAddress = computed(() => location.value?.address || '')

const formattedDateTime = computed(() => {
  if (!event.value?.timestamp) return ''
  const d = new Date(event.value.timestamp)
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const dayTitle = computed(() => {
  if (!event.value?.timestamp) return ''
  const d = new Date(event.value.timestamp)
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

function isSameDay(a, b) {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

const otherEvents = computed(() => {
  if (!event.value) return []
  const allForEmployee = eventsStore.getEmployeeEvents(event.value.employeeId)
  return allForEmployee
    .filter((e) => isSameDay(e.timestamp, event.value.timestamp) && e.id !== event.value.id)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
})

const shiftDuration = computed(() => {
  if (!event.value || event.value.type !== 'check_out') return ''
  const allForEmployee = eventsStore.getEmployeeEvents(event.value.employeeId)
  const sameDayEvents = allForEmployee
    .filter((e) => isSameDay(e.timestamp, event.value.timestamp))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  const idx = sameDayEvents.findIndex((e) => e.id === event.value.id)
  if (idx <= 0) return ''

  const lastCheckIn = [...sameDayEvents]
    .slice(0, idx)
    .reverse()
    .find((e) => e.type === 'check_in')

  if (!lastCheckIn) return ''

  const start = new Date(lastCheckIn.timestamp)
  const end = new Date(event.value.timestamp)
  const diffMs = end - start
  if (diffMs <= 0) return ''

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}ч ${minutes}мин`
})

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function goBack() {
  router.back()
}
</script>

<style scoped>
</style>


