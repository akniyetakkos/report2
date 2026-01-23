<template>
    <q-dialog v-model="showDialog" persistent>
        <q-card style="min-width: 350px">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">
                    {{ dialogTitle }}
                </div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section>
                <div class="text-center q-mb-md">
                    <q-icon :name="isCheckIn ? 'login' : 'logout'" :color="isCheckIn ? 'positive' : 'negative'"
                        size="64px" class="animated-icon" />
                </div>

                <q-list>
                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="event" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label caption>Дата и время</q-item-label>
                            <q-item-label>{{ formattedDateTime }}</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="location_on" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label caption>Рабочая точка</q-item-label>
                            <q-item-label>{{ data.locationName }}</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item v-if="showCoordinates">
                        <q-item-section avatar>
                            <q-icon name="gps_fixed" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label caption>Координаты</q-item-label>
                            <q-item-label class="text-caption">
                                {{ data.lat?.toFixed(6) }}, {{ data.lng?.toFixed(6) }}
                            </q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item v-if="workDuration">
                        <q-item-section avatar>
                            <q-icon name="schedule" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label caption>Время на работе</q-item-label>
                            <q-item-label>{{ workDuration }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>

                <q-banner class="bg-positive text-white q-mt-md" rounded dense>
                    <template v-slot:avatar>
                        <q-icon name="check_circle" />
                    </template>
                    {{ successMessage }}
                </q-banner>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn v-if="showCancelButton" label="Отменить" color="grey-7" flat @click="handleCancel" />
                <q-btn label="OK" color="primary" unelevated @click="handleConfirm" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { computed, watch } from 'vue'
const props = defineProps({
    modelValue: Boolean,
    type: {
        type: String,
        validator: (val) => ['check_in', 'check_out'].includes(val),
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    showCoordinates: {
        type: Boolean,
        default: false
    },
    showCancelButton: {
        type: Boolean,
        default: false
    },
    gracePeriod: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const isCheckIn = computed(() => props.type === 'check_in')

const dialogTitle = computed(() => {
    return isCheckIn.value ? 'Вход зарегистрирован' : 'Выход зарегистрирован'
})

const successMessage = computed(() => {
    return isCheckIn.value
        ? 'Вы успешно зарегистрировали начало рабочего дня'
        : 'Вы успешно зарегистрировали окончание рабочего дня'
})

const formattedDateTime = computed(() => {
    if (!props.data.timestamp) return ''
    const date = new Date(props.data.timestamp)
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
})

const workDuration = computed(() => {
    if (isCheckIn.value || !props.data.checkInTime) return null

    const checkIn = new Date(props.data.checkInTime)
    const checkOut = new Date(props.data.timestamp)
    const diff = checkOut - checkIn

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}ч ${minutes}мин`
})

function handleConfirm() {
    emit('confirm')
    showDialog.value = false
}

function handleCancel() {
    emit('cancel')
    showDialog.value = false
}

watch(() => props.modelValue, (newVal) => {
    if (newVal && !props.showCancelButton && props.gracePeriod === 0) {
        setTimeout(() => {
            if (showDialog.value) {
                handleConfirm()
            }
        }, 3000)
    }
})
</script>

<style scoped>
.animated-icon {
    animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
    0% {
        transform: scale(0);
        opacity: 0;
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>