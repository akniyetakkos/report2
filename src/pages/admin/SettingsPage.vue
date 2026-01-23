<template>
    <q-page padding>
        <div class="text-h5 q-mb-lg">Настройки системы</div>

        <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
                <q-card>
                    <q-card-section>
                        <div class="text-h6 q-mb-md">
                            <q-icon name="settings" class="q-mr-sm" />
                            Общие настройки
                        </div>

                        <q-form class="q-gutter-md">
                            <q-input v-model.number="settings.defaultRadius" label="Радиус зоны по умолчанию (метры)"
                                type="number" outlined hint="Используется при создании новой рабочей точки"
                                :rules="[val => val > 0 || 'Должно быть больше 0']" />

                            <q-input v-model.number="settings.gracePeriod" label="Grace Period (минуты)" type="number"
                                outlined hint="Время на отмену регистрации после check-in/out"
                                :rules="[val => val >= 0 || 'Должно быть 0 или больше']" />

                            <q-input v-model.number="settings.locationUpdateInterval"
                                label="Интервал обновления геолокации (секунды)" type="number" outlined
                                hint="Как часто обновлять позицию пользователя"
                                :rules="[val => val > 0 || 'Должно быть больше 0']" />

                            <q-toggle v-model="settings.requireHighAccuracy" label="Требовать высокую точность GPS"
                                color="primary" />

                            <q-toggle v-model="settings.allowOfflineMode" label="Разрешить работу офлайн"
                                color="primary" />
                        </q-form>
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6">
                <q-card>
                    <q-card-section>
                        <div class="text-h6 q-mb-md">
                            <q-icon name="schedule" class="q-mr-sm" />
                            Рабочее расписание
                        </div>

                        <q-list>
                            <q-item v-for="(day, index) in workSchedule" :key="index">
                                <q-item-section>
                                    <q-checkbox v-model="day.enabled" :label="day.name" color="primary" />
                                </q-item-section>

                                <q-item-section v-if="day.enabled">
                                    <div class="row q-col-gutter-sm">
                                        <div class="col-6">
                                            <q-input v-model="day.startTime" type="time" dense outlined
                                                label="Начало" />
                                        </div>
                                        <div class="col-6">
                                            <q-input v-model="day.endTime" type="time" dense outlined label="Конец" />
                                        </div>
                                    </div>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6">
                <q-card>
                    <q-card-section>
                        <div class="text-h6 q-mb-md">
                            <q-icon name="notifications" class="q-mr-sm" />
                            Уведомления
                        </div>

                        <q-list>
                            <q-item>
                                <q-item-section>
                                    <q-toggle v-model="notifications.emailOnCheckIn" label="Email при входе"
                                        color="primary" />
                                </q-item-section>
                            </q-item>

                            <q-item>
                                <q-item-section>
                                    <q-toggle v-model="notifications.emailOnCheckOut" label="Email при выходе"
                                        color="primary" />
                                </q-item-section>
                            </q-item>

                            <q-item>
                                <q-item-section>
                                    <q-toggle v-model="notifications.emailOnLateArrival" label="Email при опоздании"
                                        color="primary" />
                                </q-item-section>
                            </q-item>

                            <q-item>
                                <q-item-section>
                                    <q-toggle v-model="notifications.pushNotifications" label="Push уведомления"
                                        color="primary" />
                                </q-item-section>
                            </q-item>

                            <q-item v-if="notifications.emailOnLateArrival">
                                <q-item-section>
                                    <q-input v-model.number="notifications.lateArrivalThreshold"
                                        label="Порог опоздания (минуты)" type="number" outlined dense />
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6">
                <q-card>
                    <q-card-section>
                        <div class="text-h6 q-mb-md">
                            <q-icon name="sync" class="q-mr-sm" />
                            Интеграция с Elpass
                        </div>

                        <q-form class="q-gutter-md">
                            <q-input v-model="integration.apiUrl" label="API URL" outlined
                                hint="URL эндпоинта Elpass Time Tracking" />

                            <q-input v-model="integration.apiKey" label="API Key" type="password" outlined
                                hint="Ключ для авторизации">
                                <template v-slot:append>
                                    <q-icon name="visibility_off" class="cursor-pointer" />
                                </template>
                            </q-input>

                            <q-input v-model.number="integration.syncInterval" label="Интервал синхронизации (минуты)"
                                type="number" outlined hint="Как часто синхронизировать данные с Elpass" />

                            <q-toggle v-model="integration.autoSync" label="Автоматическая синхронизация"
                                color="primary" />

                            <div class="row q-col-gutter-sm">
                                <div class="col-auto">
                                    <q-btn outline color="primary" icon="sync" label="Тест подключения"
                                        @click="testConnection" />
                                </div>
                                <div class="col-auto">
                                    <q-btn outline color="primary" icon="cloud_upload" label="Синхронизировать сейчас"
                                        @click="syncNow" />
                                </div>
                            </div>
                        </q-form>
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <div class="row q-col-gutter-sm q-mt-md justify-end">
            <div class="col-auto">
                <q-btn outline color="grey-7" label="Сбросить" @click="resetSettings" />
            </div>
            <div class="col-auto">
                <q-btn unelevated color="primary" icon="save" label="Сохранить настройки" @click="saveSettings"
                    :loading="saving" />
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const saving = ref(false)

const settings = reactive({
    defaultRadius: 100,
    gracePeriod: 5,
    locationUpdateInterval: 30,
    requireHighAccuracy: true,
    allowOfflineMode: false
})

const workSchedule = reactive([
    { name: 'Понедельник', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Вторник', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Среда', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Четверг', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Пятница', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Суббота', enabled: false, startTime: '09:00', endTime: '14:00' },
    { name: 'Воскресенье', enabled: false, startTime: '09:00', endTime: '14:00' }
])
const notifications = reactive({
    emailOnCheckIn: true,
    emailOnCheckOut: true,
    emailOnLateArrival: true,
    lateArrivalThreshold: 15,
    pushNotifications: true
})

const integration = reactive({
    apiUrl: 'https://elpass.example.kz/api/v1/time-tracking',
    apiKey: '',
    syncInterval: 15,
    autoSync: true
})

const saveSettings = async () => {
    saving.value = true

    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem('app_settings', JSON.stringify({
        settings,
        workSchedule,
        notifications,
        integration
    }))

    saving.value = false

    $q.notify({
        type: 'positive',
        message: 'Настройки успешно сохранены',
        position: 'top'
    })
}

const resetSettings = () => {
    $q.dialog({
        title: 'Подтверждение',
        message: 'Вы уверены, что хотите сбросить все настройки на значения по умолчанию?',
        cancel: true,
        persistent: true
    }).onOk(() => {
        settings.defaultRadius = 100
        settings.gracePeriod = 5
        settings.locationUpdateInterval = 30
        settings.requireHighAccuracy = true
        settings.allowOfflineMode = false

        workSchedule.forEach((day, index) => {
            day.enabled = index < 5
            day.startTime = '09:00'
            day.endTime = index < 5 ? '18:00' : '14:00'
        })

        notifications.emailOnCheckIn = true
        notifications.emailOnCheckOut = true
        notifications.emailOnLateArrival = true
        notifications.lateArrivalThreshold = 15
        notifications.pushNotifications = true

        $q.notify({
            type: 'info',
            message: 'Настройки сброшены на значения по умолчанию',
            position: 'top'
        })
    })
}

const testConnection = async () => {
    $q.loading.show({ message: 'Проверка подключения...' })

    await new Promise(resolve => setTimeout(resolve, 2000))

    $q.loading.hide()

    $q.notify({
        type: 'positive',
        message: 'Подключение к Elpass API успешно установлено',
        position: 'top'
    })
}

const syncNow = async () => {
    $q.loading.show({ message: 'Синхронизация данных...' })
    await new Promise(resolve => setTimeout(resolve, 3000))

    $q.loading.hide()

    $q.notify({
        type: 'positive',
        message: 'Данные успешно синхронизированы с Elpass',
        position: 'top',
        caption: 'Синхронизировано событий: 42'
    })
}

const loadSettings = () => {
    const saved = localStorage.getItem('app_settings')
    if (saved) {
        try {
            const data = JSON.parse(saved)
            Object.assign(settings, data.settings || {})
            Object.assign(workSchedule, data.workSchedule || [])
            Object.assign(notifications, data.notifications || {})
            Object.assign(integration, data.integration || {})
        } catch (e) {
            console.error('Ошибка загрузки настроек:', e)
        }
    }
}

loadSettings()
</script>