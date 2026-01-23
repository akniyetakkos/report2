<template>
    <q-page padding>
        <div class="text-h5 q-mb-lg">Дашборд</div>
        <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-6 col-md-3">
                <q-card class="stat-card">
                    <q-card-section>
                        <div class="row items-center">
                            <div class="col">
                                <div class="text-h6">{{ activeEmployees.length }}</div>
                                <div class="text-grey-7">Сейчас на работе</div>
                            </div>
                            <div class="col-auto">
                                <q-icon name="people" size="48px" color="green" />
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
                <q-card class="stat-card">
                    <q-card-section>
                        <div class="row items-center">
                            <div class="col">
                                <div class="text-h6">{{ todayCheckIns }}</div>
                                <div class="text-grey-7">Входов сегодня</div>
                            </div>
                            <div class="col-auto">
                                <q-icon name="login" size="48px" color="blue" />
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
                <q-card class="stat-card">
                    <q-card-section>
                        <div class="row items-center">
                            <div class="col">
                                <div class="text-h6">{{ todayCheckOuts }}</div>
                                <div class="text-grey-7">Выходов сегодня</div>
                            </div>
                            <div class="col-auto">
                                <q-icon name="logout" size="48px" color="orange" />
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
                <q-card class="stat-card">
                    <q-card-section>
                        <div class="row items-center">
                            <div class="col">
                                <div class="text-h6">{{ locationStore.locations.length }}</div>
                                <div class="text-grey-7">Рабочих точек</div>
                            </div>
                            <div class="col-auto">
                                <q-icon name="place" size="48px" color="primary" />
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
                <q-card class="q-mb-md">
                    <q-card-section>
                        <div class="text-h6 q-mb-md">
                            <q-icon name="people" class="q-mr-sm" />
                            Сейчас на работе
                        </div>

                        <q-list separator v-if="activeEmployees.length > 0">
                            <q-item v-for="emp in activeEmployees" :key="emp.employeeId">
                                <q-item-section avatar>
                                    <q-avatar color="green" text-color="white" icon="person" />
                                </q-item-section>

                                <q-item-section>
                                    <q-item-label>{{ emp.employeeName }}</q-item-label>
                                    <q-item-label caption>{{ emp.locationName }}</q-item-label>
                                    <q-item-label caption class="text-grey-6">
                                        С {{ formatTime(emp.lastEvent) }}
                                    </q-item-label>
                                </q-item-section>

                                <q-item-section side>
                                    <q-chip color="green" text-color="white" size="sm">
                                        Работает
                                    </q-chip>
                                </q-item-section>
                            </q-item>
                        </q-list>

                        <div v-else class="text-center text-grey-6 q-py-md">
                            Нет сотрудников на работе
                        </div>
                    </q-card-section>
                </q-card>
                <q-card>
                    <q-card-section>
                        <div class="text-h6 q-mb-md">
                            <q-icon name="event_note" class="q-mr-sm" />
                            Последние регистрации
                        </div>

                        <q-list separator v-if="recentEvents.length > 0">
                            <q-item v-for="event in recentEvents" :key="event.id">
                                <q-item-section avatar>
                                    <q-avatar :color="event.type === 'check_in' ? 'green' : 'orange'" text-color="white"
                                        :icon="event.type === 'check_in' ? 'login' : 'logout'" />
                                </q-item-section>

                                <q-item-section>
                                    <q-item-label>{{ event.employeeName }}</q-item-label>
                                    <q-item-label caption>{{ event.locationName }}</q-item-label>
                                    <q-item-label caption class="text-grey-6">
                                        {{ formatDateTime(event.timestamp) }}
                                    </q-item-label>
                                </q-item-section>

                                <q-item-section side>
                                    <q-chip :color="event.type === 'check_in' ? 'green' : 'orange'" text-color="white"
                                        size="sm">
                                        {{ event.type === 'check_in' ? 'Вход' : 'Выход' }}
                                    </q-chip>
                                </q-item-section>
                            </q-item>
                        </q-list>

                        <div v-else class="text-center text-grey-6 q-py-md">
                            Нет событий
                        </div>
                    </q-card-section>
                </q-card>
            </div>
            <div class="col-12 col-md-6">
                <q-card style="height: 700px">
                    <q-card-section class="q-pa-none" style="height: 100%">
                        <DashboardMapView :locations="locationStore.locations" :active-employees="activeEmployees" />
                    </q-card-section>
                </q-card>

                <div class="q-mt-sm text-center">
                    <q-btn flat color="primary" icon="refresh" label="Обновить данные" @click="refreshData"
                        :loading="loading" />
                </div>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdminEventsStore } from 'src/stores/adminEventsStore'
import { useAdminLocationStore } from 'src/stores/adminLocationStore'
import DashboardMapView from 'src/components/admin/DashboardMapView.vue'

const eventsStore = useAdminEventsStore()
const locationStore = useAdminLocationStore()

const loading = ref(false)
let refreshInterval = null

const activeEmployees = computed(() => eventsStore.getActiveEmployees())

const todayEvents = computed(() => eventsStore.getTodayEvents())

const todayCheckIns = computed(() =>
    todayEvents.value.filter(e => e.type === 'check_in').length
)

const todayCheckOuts = computed(() =>
    todayEvents.value.filter(e => e.type === 'check_out').length
)

const recentEvents = computed(() => {
    return [...eventsStore.events]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
})

const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Только что'
    if (minutes < 60) return `${minutes} мин назад`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ч назад`

    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

const refreshData = async () => {
    loading.value = true
    try {
        await Promise.all([
            eventsStore.fetchEvents(),
            locationStore.fetchLocations()
        ])
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    refreshData()

    refreshInterval = setInterval(() => {
        refreshData()
    }, 30000)
})

onUnmounted(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
    }
})
</script>

<style scoped>
.stat-card {
    transition: transform 0.2s;
}

.stat-card:hover {
    transform: translateY(-4px);
}
</style>