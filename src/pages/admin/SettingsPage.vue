<template>
    <q-page padding>
        <div class="text-h5 q-mb-sm">Настройки</div>
        <div class="text-caption text-grey-7 q-mb-lg">Управляйте профилем, расписанием и уведомлениями</div>

        <div class="row q-col-gutter-md">
            <!-- Общие настройки - СОХРАНЯЕМ ПОЛНОСТЬЮ -->
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

            <!-- Общие настройки (профиль) - КАК НА ФОТО -->
            <div class="col-12 col-md-6">
                <q-card>
                    <q-card-section>
                        <div class="text-h6 q-mb-sm">Общие настройки</div>
                        <div class="text-caption text-grey-7 q-mb-md">Информация о вашем профиле</div>

                        <div class="row items-center q-mb-lg">
                            <div class="col-auto q-mr-md">
                                <q-avatar size="80px">
                                    <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                                </q-avatar>
                            </div>
                            <div class="col">
                                <div class="text-subtitle1 text-weight-medium q-mb-xs">Аватар профиля</div>
                                <div class="q-gutter-sm">
                                    <q-btn outline color="primary" label="Загрузить фото" size="sm" />
                                    <q-btn outline color="negative" label="Удалить" size="sm" />
                                </div>
                            </div>
                        </div>

                        <q-input v-model="profile.userName" label="Имя пользователя" outlined dense class="q-mb-md" />
                        <q-input v-model="profile.email" label="Электронная почта" outlined dense class="q-mb-md" />
                        <q-select v-model="profile.timezone" :options="timezoneOptions" label="Часовой пояс" outlined
                            dense />
                    </q-card-section>
                </q-card>
            </div>

            <!-- Рабочее расписание - КАК НА ФОТО -->
            <div class="col-12">
                <q-card>
                    <q-card-section>
                        <div class="text-h6 q-mb-sm">Рабочее расписание</div>
                        <div class="text-caption text-grey-7 q-mb-md">Установите часы доступности для встреч</div>

                        <div class="schedule-list">
                            <div v-for="(day, index) in workSchedule" :key="index"
                                class="schedule-item row items-center q-py-sm">
                                <div class="col-3">
                                    <q-toggle v-model="day.enabled" :label="day.name" color="primary" />
                                </div>

                                <div class="col-9 row items-center justify-end" v-if="day.enabled">
                                    <div class="text-body2">{{ day.startTime }}</div>
                                    <div class="text-grey-7 q-mx-md">—</div>
                                    <div class="text-body2">{{ day.endTime }}</div>
                                </div>

                                <div class="col-9 text-right" v-else>
                                    <div class="text-grey-5">Недоступно</div>
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>

            <!-- Уведомления - КАК НА ФОТО -->
            <div class="col-12">
                <q-card>
                    <q-card-section>
                        <div class="text-h6 q-mb-sm">Уведомления</div>
                        <div class="text-caption text-grey-7 q-mb-md">Настройте каналы связи</div>

                        <div class="notifications-list">
                            <div class="notification-item row items-center q-py-md">
                                <div class="col">
                                    <div class="text-subtitle2 q-mb-xs">Новые задачи</div>
                                    <div class="text-caption text-grey-7">Уведомления о назначении новых задач</div>
                                </div>
                                <div class="col-auto">
                                    <q-toggle v-model="notifications.newTasks" color="primary" />
                                </div>
                            </div>

                            <q-separator />

                            <div class="notification-item row items-center q-py-md">
                                <div class="col">
                                    <div class="text-subtitle2 q-mb-xs">Комментарии</div>
                                    <div class="text-caption text-grey-7">Ответы и упоминания в комментариях</div>
                                </div>
                                <div class="col-auto">
                                    <q-toggle v-model="notifications.comments" color="primary" />
                                </div>
                            </div>

                            <q-separator />

                            <div class="notification-item row items-center q-py-md">
                                <div class="col">
                                    <div class="text-subtitle2 q-mb-xs">Новости продукта</div>
                                    <div class="text-caption text-grey-7">Обновления системы и новые функции</div>
                                </div>
                                <div class="col-auto">
                                    <q-toggle v-model="notifications.productNews" color="primary" />
                                </div>
                            </div>

                            <q-separator />

                            <div class="notification-item row items-center q-py-md">
                                <div class="col">
                                    <div class="text-subtitle2 q-mb-xs">Безопасность</div>
                                    <div class="text-caption text-grey-7">Входы с новых устройств</div>
                                </div>
                                <div class="col-auto">
                                    <q-toggle v-model="notifications.security" color="primary" />
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <!-- Кнопки внизу - КАК НА ФОТО -->
        <div class="row q-col-gutter-sm q-mt-lg justify-end">
            <div class="col-auto">
                <q-btn outline color="grey-7" label="Отменить" @click="cancelChanges" padding="8px 24px" />
            </div>
            <div class="col-auto">
                <q-btn unelevated color="primary" label="Сохранить изменения" @click="saveSettings" :loading="saving"
                    padding="8px 24px" />
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const saving = ref(false)

// Общие настройки (системные) - СОХРАНЯЕМ
const settings = reactive({
    defaultRadius: 100,
    gracePeriod: 5,
    locationUpdateInterval: 30,
    requireHighAccuracy: true,
    allowOfflineMode: false
})

// Профиль пользователя
const profile = reactive({
    userName: 'Александр Волков',
    email: 'alex.volkov@example.com',
    timezone: '(GMT+03:00) Москва'
})

const timezoneOptions = [
    '(GMT+03:00) Москва',
    '(GMT+05:00) Алматы',
    '(GMT+06:00) Астана'
]

// Рабочее расписание - как на фото
const workSchedule = reactive([
    { name: 'Понедельник', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Вторник', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Среда', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Четверг', enabled: true, startTime: '09:00', endTime: '18:00' },
    { name: 'Пятница', enabled: true, startTime: '09:00', endTime: '17:00' },
    { name: 'Суббота', enabled: false, startTime: '09:00', endTime: '14:00' },
    { name: 'Воскресенье', enabled: false, startTime: '09:00', endTime: '14:00' }
])

// Уведомления - как на фото
const notifications = reactive({
    newTasks: true,
    comments: true,
    productNews: true,
    security: true
})

const saveSettings = async () => {
    saving.value = true

    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem('app_settings', JSON.stringify({
        settings,
        profile,
        workSchedule,
        notifications
    }))

    saving.value = false

    $q.notify({
        type: 'positive',
        message: 'Настройки успешно сохранены',
        position: 'top'
    })
}

const cancelChanges = () => {
    loadSettings()
    $q.notify({
        type: 'info',
        message: 'Изменения отменены',
        position: 'top'
    })
}

const loadSettings = () => {
    const saved = localStorage.getItem('app_settings')
    if (saved) {
        try {
            const data = JSON.parse(saved)
            Object.assign(settings, data.settings || {})
            Object.assign(profile, data.profile || {})
            Object.assign(workSchedule, data.workSchedule || [])
            Object.assign(notifications, data.notifications || {})
        } catch (e) {
            console.error('Ошибка загрузки настроек:', e)
        }
    }
}

loadSettings()
</script>

<style scoped>
.schedule-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.schedule-item:last-child {
    border-bottom: none;
}

.notification-item {
    min-height: 60px;
}
</style>