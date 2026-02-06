<template>
    <q-page padding>
        <div class="row q-col-gutter-md">
            <div class="col-12 col-md-5">
                <q-card>
                    <q-card-section>
                        <div class="text-h6 q-mb-md">
                            Рабочие точки
                            <q-btn flat round dense icon="add" color="primary" @click="openCreateDialog"
                                class="float-right">
                                <q-tooltip>Добавить точку на карте</q-tooltip>
                            </q-btn>
                        </div>

                        <q-list separator>
                            <q-item v-for="location in locationStore.locations" :key="location.id" clickable
                                :active="selectedLocation?.id === location.id" @click="selectLocation(location)">
                                <q-item-section avatar>
                                    <q-icon :name="location.active ? 'place' : 'location_off'"
                                        :color="location.active ? 'primary' : 'grey'" />
                                </q-item-section>

                                <q-item-section>
                                    <q-item-label>{{ location.name }}</q-item-label>
                                    <q-item-label caption>{{ location.address }}</q-item-label>
                                    <q-item-label caption class="text-grey-6">
                                        Радиус: {{ location.radius }}м
                                    </q-item-label>
                                </q-item-section>

                                <q-item-section side>
                                    <div class="row q-gutter-xs">
                                        <q-btn flat round dense icon="edit" size="sm"
                                            @click.stop="openEditDialog(location)" />
                                        <q-btn flat round dense icon="delete" size="sm" color="negative"
                                            @click.stop="confirmDelete(location)" />
                                    </div>
                                </q-item-section>
                            </q-item>

                            <q-item v-if="locationStore.locations.length === 0">
                                <q-item-section class="text-center text-grey-6">
                                    <div>Нет рабочих точек</div>
                                    <div class="text-caption">Добавьте первую точку кликом на карте</div>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-7">
                <q-card style="height: calc(100vh - 120px)">
                    <q-card-section class="q-pa-none" style="height: 100%">
                        <AdminMapView :locations="locationStore.locations" :selected-location="selectedLocation"
                            @location-clicked="handleMapClick" @marker-clicked="selectLocation" />
                    </q-card-section>
                </q-card>

                <div class="q-mt-sm text-caption text-grey-6 text-center">
                    💡 Кликните на карте, чтобы создать новую рабочую точку
                </div>
            </div>
        </div>

        <q-dialog v-model="showDialog" persistent>
            <q-card style="min-width: 400px">
                <q-card-section>
                    <div class="text-h6">
                        {{ editMode ? 'Редактировать точку' : 'Новая рабочая точка' }}
                    </div>
                </q-card-section>

                <q-card-section>
                    <q-form @submit="handleSubmit" class="q-gutter-md">
                        <q-input v-model="formData.name" label="Название *" outlined
                            :rules="[val => !!val || 'Обязательное поле']" />

                        <q-input v-model="formData.address" label="Адрес *" outlined
                            :rules="[val => !!val || 'Обязательное поле']" />

                        <div class="row q-col-gutter-sm">
                            <div class="col-6">
                                <q-input v-model.number="formData.lat" label="Широта *" type="number" outlined
                                    step="0.000001" :rules="[val => !!val || 'Обязательное поле']" readonly />
                            </div>
                            <div class="col-6">
                                <q-input v-model.number="formData.lng" label="Долгота *" type="number" outlined
                                    step="0.000001" :rules="[val => !!val || 'Обязательное поле']" readonly />
                            </div>
                        </div>

                        <q-input v-model.number="formData.radius" label="Радиус зоны (метры) *" type="number" outlined
                            :rules="[
                                val => !!val || 'Обязательное поле',
                                val => val > 0 || 'Должно быть больше 0'
                            ]" hint="Расстояние в метрах для возможности отметиться" />

                        <q-toggle v-model="formData.active" label="Активна" color="primary" />
                    </q-form>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Отмена" color="grey-7" v-close-popup />
                    <q-btn unelevated :label="editMode ? 'Сохранить' : 'Создать'" color="primary" @click="handleSubmit"
                        :loading="loading" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useAdminLocationStore } from 'src/stores/adminLocationStore'
import AdminMapView from 'src/components/admin/AdminMapView.vue'

const $q = useQuasar()
const locationStore = useAdminLocationStore()

const selectedLocation = ref(null)
const showDialog = ref(false)
const editMode = ref(false)
const loading = ref(false)

const formData = reactive({
    name: '',
    address: '',
    lat: null,
    lng: null,
    radius: 100,
    active: true
})

const resetForm = () => {
    formData.name = ''
    formData.address = ''
    formData.lat = null
    formData.lng = null
    formData.radius = 100
    formData.active = true
}

const openCreateDialog = () => {
    resetForm()
    editMode.value = false
    showDialog.value = true
}

const handleMapClick = (coords) => {
    formData.lat = coords.lat
    formData.lng = coords.lng

    if (!showDialog.value) {
        openCreateDialog()
    }
}

const selectLocation = (location) => {
    selectedLocation.value = location
}

const openEditDialog = (location) => {
    editMode.value = true
    formData.name = location.name
    formData.address = location.address
    formData.lat = location.lat
    formData.lng = location.lng
    formData.radius = location.radius
    formData.active = location.active
    selectedLocation.value = location
    showDialog.value = true
}

const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.lat || !formData.lng) {
        $q.notify({
            type: 'negative',
            message: 'Заполните все обязательные поля',
            position: 'top'
        })
        return
    }

    loading.value = true

    try {
        if (editMode.value) {
            await locationStore.updateLocation(selectedLocation.value.id, {
                name: formData.name,
                address: formData.address,
                lat: formData.lat,
                lng: formData.lng,
                radius: formData.radius,
                active: formData.active
            })
            $q.notify({
                type: 'positive',
                message: 'Точка успешно обновлена',
                position: 'top'
            })
        } else {
            await locationStore.createLocation({
                name: formData.name,
                address: formData.address,
                lat: formData.lat,
                lng: formData.lng,
                radius: formData.radius
            })
            $q.notify({
                type: 'positive',
                message: 'Точка успешно создана',
                position: 'top'
            })
        }
        showDialog.value = false
        resetForm()
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: error.message || 'Ошибка сохранения',
            position: 'top'
        })
    } finally {
        loading.value = false
    }
}

const confirmDelete = (location) => {
    $q.dialog({
        title: 'Подтверждение',
        message: `Удалить точку "${location.name}"?`,
        cancel: true,
        persistent: true
    }).onOk(async () => {
        try {
            await locationStore.deleteLocation(location.id)
            if (selectedLocation.value?.id === location.id) {
                selectedLocation.value = null
            }
            $q.notify({
                type: 'positive',
                message: 'Точка удалена',
                position: 'top'
            })
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: error.message || 'Ошибка удаления',
                position: 'top'
            })
        }
    })
}

locationStore.fetchLocations()
</script>