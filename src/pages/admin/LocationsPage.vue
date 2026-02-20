<template>
    <q-page class="locations-page">
        <div class="row no-wrap full-height">
            <!-- Левая панель: Управление точками -->
            <div class="locations-panel">
                <div class="panel-header">
                    <div class="text-h6 text-weight-medium q-mb-xs">Управление точками</div>
                    <div class="row items-center justify-between">
                        <div class="text-subtitle1 text-weight-medium">Рабочие точки</div>
                        <q-btn unelevated color="primary" icon="add" round dense @click="openCreateDialog" />
                    </div>
                </div>

                <q-separator />

                <q-scroll-area class="locations-list">
                    <q-list>
                        <q-item v-for="location in locationStore.locations" :key="location.id" clickable
                            :active="selectedLocation?.id === location.id" @click="selectLocation(location)"
                            class="location-item">
                            <q-item-section>
                                <q-item-label class="text-weight-medium">{{ location.name }}</q-item-label>
                                <q-item-label caption lines="2">{{ location.address }}</q-item-label>
                                <q-item-label caption class="text-grey-6 q-mt-xs">
                                    Радиус: {{ location.radius }}м
                                </q-item-label>
                            </q-item-section>

                            <q-item-section side>
                                <div class="row q-gutter-xs">
                                    <q-btn flat round dense icon="edit" size="sm" @click.stop="openEditDialog(location)" />
                                    <q-btn flat round dense icon="delete" size="sm" color="negative"
                                        @click.stop="confirmDelete(location)" />
                                </div>
                            </q-item-section>
                        </q-item>

                        <q-item v-if="locationStore.locations.length === 0">
                            <q-item-section class="text-center text-grey-6 q-py-lg">
                                <div>Нет рабочих точек</div>
                                <div class="text-caption q-mt-sm">Добавьте первую точку</div>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-scroll-area>
            </div>

            <!-- Правая панель: Карта -->
            <div class="map-panel">
                <q-card flat class="full-height">
                    <q-card-section class="q-pa-none full-height">
                        <AdminMapView :locations="locationStore.locations" :selected-location="selectedLocation"
                            @location-clicked="handleMapClick" @marker-clicked="selectLocation" />
                    </q-card-section>
                </q-card>

                <div class="map-hint">
                    <span class="text-caption text-grey-6">Кликните на карте, чтобы создать новую рабочую точку</span>
                </div>
            </div>
        </div>

        <!-- Модальное окно добавления/редактирования -->
        <q-dialog v-model="showDialog" persistent>
            <q-card class="location-dialog" style="min-width: 500px; max-width: 600px">
                <q-card-section class="dialog-header">
                    <div class="text-h6 text-weight-bold q-mb-xs">
                        {{ editMode ? 'Редактировать точку' : 'Новая рабочая точка' }}
                    </div>
                    <div class="text-body2 text-grey-7">
                        {{ editMode ? 'Измените данные локации' : 'Заполните данные для создания новой локации.' }}
                    </div>
                </q-card-section>

                <q-separator />

                <q-card-section>
                    <q-form @submit="handleSubmit" class="q-gutter-md">
                        <q-input v-model="formData.name" label="Название точки" outlined
                            placeholder="Например: Главный офис"
                            :rules="[val => !!val || 'Обязательное поле']" />

                        <q-input v-model="formData.address" label="Адрес" outlined
                            placeholder="Улица, дом, город"
                            :rules="[val => !!val || 'Обязательное поле']" />

                        <q-input v-model.number="formData.radius" label="Радиус (метров)" type="number" outlined
                            :rules="[
                                val => !!val || 'Обязательное поле',
                                val => val > 0 || 'Должно быть больше 0'
                            ]" />

                        <div>
                            <div class="text-body2 text-weight-medium q-mb-sm">Координаты</div>
                            <div class="row q-col-gutter-sm">
                                <div class="col-6">
                                    <q-input v-model.number="formData.lat" label="Широта" type="number" outlined
                                        step="0.000001" :rules="[val => !!val || 'Обязательное поле']" readonly />
                                </div>
                                <div class="col-6">
                                    <q-input v-model.number="formData.lng" label="Долгота" type="number" outlined
                                        step="0.000001" :rules="[val => !!val || 'Обязательное поле']" readonly />
                                </div>
                            </div>
                        </div>

                        <div v-if="formData.lat && formData.lng" class="q-mt-md">
                            <MapPreview :lat="formData.lat" :lng="formData.lng" @map-clicked="handlePreviewMapClick" />
                            <div class="q-mt-sm text-center">
                                <q-btn outline color="primary" size="sm" label="Указать на карте" icon="place"
                                    @click="openMapSelector" />
                            </div>
                        </div>
                        <div v-else class="q-mt-md text-center">
                            <q-btn outline color="primary" size="sm" label="Указать на карте" icon="place"
                                @click="openMapSelector" />
                        </div>

                        <q-toggle v-model="formData.active" label="Активна" color="primary" />
                    </q-form>
                </q-card-section>

                <q-separator />

                <q-card-actions align="right" class="q-pa-md">
                    <q-btn flat label="Отмена" color="grey-7" @click="showDialog = false" />
                    <q-btn unelevated :label="editMode ? 'Сохранить' : 'Создать точку'" color="primary"
                        @click="handleSubmit" :loading="loading" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Диалог выбора координат на большой карте -->
        <q-dialog v-model="showMapSelector" persistent full-width>
            <q-card style="min-width: 800px; height: 600px">
                <q-card-section class="row items-center q-pb-none">
                    <div class="text-h6">Выберите местоположение на карте</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
                    <div ref="selectorMapContainer" class="selector-map-container"></div>
                </q-card-section>

                <q-card-actions align="right" class="q-pa-md">
                    <q-btn flat label="Отмена" color="grey-7" @click="showMapSelector = false" />
                    <q-btn unelevated label="Выбрать" color="primary" @click="confirmMapSelection" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useAdminLocationStore } from 'src/stores/adminLocationStore'
import AdminMapView from 'src/components/admin/AdminMapView.vue'
import MapPreview from 'src/components/admin/MapPreview.vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const $q = useQuasar()
const locationStore = useAdminLocationStore()

const selectedLocation = ref(null)
const showDialog = ref(false)
const showMapSelector = ref(false)
const editMode = ref(false)
const loading = ref(false)
const selectorMapContainer = ref(null)
let selectorMap = null
let selectorMarker = null
const tempCoords = ref({ lat: null, lng: null })

const formData = reactive({
    name: '',
    address: '',
    lat: null,
    lng: null,
    radius: 150,
    active: true
})

const resetForm = () => {
    formData.name = ''
    formData.address = ''
    formData.lat = null
    formData.lng = null
    formData.radius = 150
    formData.active = true
    tempCoords.value = { lat: null, lng: null }
}

const openCreateDialog = () => {
    resetForm()
    editMode.value = false
    showDialog.value = true
}

const handleMapClick = (coords) => {
    formData.lat = coords.lat
    formData.lng = coords.lng
    tempCoords.value = coords

    if (!showDialog.value) {
        openCreateDialog()
    }
}

const handlePreviewMapClick = (coords) => {
    formData.lat = coords.lat
    formData.lng = coords.lng
    tempCoords.value = coords
}

const openMapSelector = () => {
    showMapSelector.value = true
    nextTick(() => {
        initSelectorMap()
    })
}

const initSelectorMap = () => {
    if (!selectorMapContainer.value) return

    if (selectorMap) {
        selectorMap.remove()
    }

    const center = formData.lat && formData.lng
        ? [formData.lat, formData.lng]
        : [51.1282, 71.4306]

    selectorMap = L.map(selectorMapContainer.value, {
        center,
        zoom: formData.lat && formData.lng ? 15 : 12,
        zoomControl: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(selectorMap)

    if (formData.lat && formData.lng) {
        selectorMarker = L.marker([formData.lat, formData.lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            })
        }).addTo(selectorMap)
    }

    selectorMap.on('click', (e) => {
        const coords = {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        }

        if (selectorMarker) {
            selectorMap.removeLayer(selectorMarker)
        }

        selectorMarker = L.marker([coords.lat, coords.lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            })
        }).addTo(selectorMap)

        tempCoords.value = coords
    })
}

const confirmMapSelection = () => {
    if (tempCoords.value.lat && tempCoords.value.lng) {
        formData.lat = tempCoords.value.lat
        formData.lng = tempCoords.value.lng
    }
    showMapSelector.value = false
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
    formData.active = location.active !== undefined ? location.active : true
    tempCoords.value = { lat: location.lat, lng: location.lng }
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

onMounted(() => {
    locationStore.fetchLocations()
})
</script>

<style scoped>
.locations-page {
    height: calc(100vh - 64px);
    padding: 0;
}

.locations-panel {
    width: 400px;
    min-width: 350px;
    max-width: 450px;
    background: white;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e0e0e0;
}

.panel-header {
    padding: 20px;
}

.locations-list {
    flex: 1;
    height: calc(100vh - 200px);
}

.location-item {
    padding: 12px 20px;
    border-bottom: 1px solid #f5f5f5;
}

.location-item:hover {
    background-color: #f9f9f9;
}

.location-item.q-item--active {
    background-color: #e3f2fd;
}

.map-panel {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
}

.map-hint {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 8px 16px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.location-dialog .dialog-header {
    padding: 24px;
}

.selector-map-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
}

@media (max-width: 1024px) {
    .locations-page {
        flex-direction: column;
    }

    .locations-panel {
        width: 100%;
        max-width: 100%;
        border-right: none;
        border-bottom: 1px solid #e0e0e0;
    }

    .map-panel {
        height: 50vh;
    }
}
</style>