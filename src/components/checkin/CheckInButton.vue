<template>
    <div class="checkin-button-container">
        <q-banner v-if="!isInWorkZone && userPosition" class="bg-warning text-white q-mb-md" dense>
            <template v-slot:avatar>
                <q-icon name="warning" />
            </template>
            Вы находитесь вне рабочей зоны. Приблизьтесь к офису для регистрации.
        </q-banner>

        <q-banner v-if="!userPosition && !geoLoading" class="bg-negative text-white q-mb-md" dense>
            <template v-slot:avatar>
                <q-icon name="gps_off" />
            </template>
            Геолокация недоступна. Разрешите доступ в настройках браузера.
        </q-banner>
        <q-card v-if="checkInStore.isCheckedIn" class="q-mb-md" bordered>
            <q-card-section>
                <div class="row items-center">
                    <q-icon name="check_circle" color="positive" size="md" class="q-mr-md" />
                    <div>
                        <div class="text-weight-bold">Вы на работе</div>
                        <div class="text-caption text-grey-7">
                            {{ nearestLocation?.name || 'Рабочая точка' }}
                        </div>
                        <div class="text-caption text-grey-6">
                            {{ formatTime(checkInStore.lastCheckIn?.timestamp) }}
                        </div>
                    </div>
                </div>
            </q-card-section>
        </q-card>
        <q-btn :label="buttonLabel" :color="buttonColor" :icon="buttonIcon"
            :loading="checkInStore.loading || isProcessing" :disable="!canPerformAction" size="lg"
            class="full-width checkin-btn" @click="handleClick" unelevated no-caps />

        <div v-if="canPerformAction" class="text-center q-mt-sm text-caption text-grey-7">
            <q-icon name="info" size="xs" />
            {{ hintText }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCheckInStore } from '../../stores/checkInStore'
import { useLocationStore } from '../../stores/locationStore'
import { useQuasar } from 'quasar'

const props = defineProps({
    userPosition: Object,
    geoLoading: Boolean
})

const emit = defineEmits(['checkin-success', 'checkout-success'])

const $q = useQuasar()
const checkInStore = useCheckInStore()
const locationStore = useLocationStore()
const isProcessing = ref(false)

const nearestLocation = computed(() => {
    if (!props.userPosition) return null
    return locationStore.findNearestLocation(
        props.userPosition.latitude,
        props.userPosition.longitude
    )
})

const isInWorkZone = computed(() => {
    return !!nearestLocation.value
})

const canPerformAction = computed(() => {
    if (!props.userPosition || props.geoLoading) return false
    if (!isInWorkZone.value) return false
    if (isProcessing.value) return false
    return true
})

const buttonLabel = computed(() => {
    if (checkInStore.isCheckedIn) return 'Check-Out (Выход)'
    return 'Check-In (Вход)'
})

const buttonColor = computed(() => {
    if (checkInStore.isCheckedIn) return 'negative'
    return 'positive'
})

const buttonIcon = computed(() => {
    if (checkInStore.isCheckedIn) return 'logout'
    return 'login'
})

const hintText = computed(() => {
    const location = nearestLocation.value
    if (!location) return ''

    const distance = Math.round(
        locationStore.getDistance(
            props.userPosition.latitude,
            props.userPosition.longitude,
            location.lat,
            location.lng
        )
    )

    return `${location.name} • ${distance}м от вас`
})

async function handleClick() {
    if (!canPerformAction.value) return

    if (isProcessing.value) return
    isProcessing.value = true

    try {
        const { latitude, longitude } = props.userPosition
        const location = nearestLocation.value

        if (checkInStore.isCheckedIn) {
            await performCheckOut(latitude, longitude, location)
        } else {
            await performCheckIn(latitude, longitude, location)
        }
    } catch (error) {
        console.error('Error:', error)
        $q.notify({
            type: 'negative',
            message: error.message || 'Произошла ошибка',
            position: 'top'
        })
    } finally {
        setTimeout(() => {
            isProcessing.value = false
        }, 1000)
    }
}

async function performCheckIn(lat, lng, location) {
    const result = await checkInStore.performCheckIn(lat, lng, location.name)

    $q.notify({
        type: 'positive',
        message: 'Вход зарегистрирован',
        caption: `${location.name} • ${formatTime(new Date())}`,
        position: 'top',
        icon: 'check_circle',
        timeout: 3000
    })

    emit('checkin-success', result)
}

async function performCheckOut(lat, lng, location) {
    const result = await checkInStore.performCheckOut(lat, lng, location.name)

    $q.notify({
        type: 'info',
        message: 'Выход зарегистрирован',
        caption: `${location.name} • ${formatTime(new Date())}`,
        position: 'top',
        icon: 'logout',
        timeout: 3000
    })

    emit('checkout-success', result)
}

function formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>

<style scoped>
.checkin-button-container {
    width: 100%;
}

.checkin-btn {
    font-weight: 600;
    height: 56px;
    font-size: 16px;
}
</style>