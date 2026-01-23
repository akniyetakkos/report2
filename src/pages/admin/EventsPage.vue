<template>
    <q-page padding>
        <q-card>
            <q-card-section>
                <div class="text-h6 q-mb-md">Журнал регистраций</div>

                <div class="row q-col-gutter-md q-mb-md">
                    <div class="col-12 col-sm-6 col-md-3">
                        <q-input v-model="filters.dateFrom" label="Дата от" type="date" outlined dense clearable />
                    </div>

                    <div class="col-12 col-sm-6 col-md-3">
                        <q-input v-model="filters.dateTo" label="Дата до" type="date" outlined dense clearable />
                    </div>

                    <div class="col-12 col-sm-6 col-md-3">
                        <q-select v-model="filters.type" :options="typeOptions" label="Тип события" outlined dense
                            clearable emit-value map-options />
                    </div>

                    <div class="col-12 col-sm-6 col-md-3">
                        <q-select v-model="filters.locationId" :options="locationOptions" label="Рабочая точка" outlined
                            dense clearable emit-value map-options />
                    </div>

                    <div class="col-12 col-sm-6 col-md-3">
                        <q-select v-model="filters.employeeId" :options="employeeOptions" label="Сотрудник" outlined
                            dense clearable emit-value map-options />
                    </div>
                </div>

                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-auto">
                        <q-btn unelevated color="primary" icon="search" label="Применить" @click="applyFilters"
                            :loading="eventsStore.loading" />
                    </div>
                    <div class="col-auto">
                        <q-btn flat color="grey-7" icon="clear" label="Сбросить" @click="resetFilters" />
                    </div>
                    <div class="col-auto">
                        <q-btn flat color="green" icon="download" label="Экспорт CSV" @click="exportToCSV" />
                    </div>
                </div>

                <q-table :rows="filteredEvents" :columns="columns" row-key="id" :loading="eventsStore.loading"
                    :pagination="pagination" @request="onRequest" flat bordered>
                    <template v-slot:body-cell-type="props">
                        <q-td :props="props">
                            <q-chip :color="props.row.type === 'check_in' ? 'green' : 'orange'" text-color="white" dense
                                size="sm">
                                {{ props.row.type === 'check_in' ? 'Вход' : 'Выход' }}
                            </q-chip>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-timestamp="props">
                        <q-td :props="props">
                            {{ formatDateTime(props.row.timestamp) }}
                        </q-td>
                    </template>

                    <template v-slot:body-cell-actions="props">
                        <q-td :props="props">
                            <q-btn flat round dense icon="visibility" size="sm" @click="viewDetails(props.row)">
                                <q-tooltip>Подробнее</q-tooltip>
                            </q-btn>
                        </q-td>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>

        <q-dialog v-model="showDetailsDialog">
            <q-card style="min-width: 400px">
                <q-card-section>
                    <div class="text-h6">Детали регистрации</div>
                </q-card-section>

                <q-card-section v-if="selectedEvent">
                    <q-list>
                        <q-item>
                            <q-item-section>
                                <q-item-label caption>ID события</q-item-label>
                                <q-item-label>{{ selectedEvent.id }}</q-item-label>
                            </q-item-section>
                        </q-item>

                        <q-item>
                            <q-item-section>
                                <q-item-label caption>Тип</q-item-label>
                                <q-item-label>
                                    <q-chip :color="selectedEvent.type === 'check_in' ? 'green' : 'orange'"
                                        text-color="white" size="sm">
                                        {{ selectedEvent.type === 'check_in' ? 'Вход' : 'Выход' }}
                                    </q-chip>
                                </q-item-label>
                            </q-item-section>
                        </q-item>

                        <q-item>
                            <q-item-section>
                                <q-item-label caption>Сотрудник</q-item-label>
                                <q-item-label>{{ selectedEvent.employeeName }}</q-item-label>
                                <q-item-label caption>ID: {{ selectedEvent.employeeId }}</q-item-label>
                            </q-item-section>
                        </q-item>

                        <q-item>
                            <q-item-section>
                                <q-item-label caption>Рабочая точка</q-item-label>
                                <q-item-label>{{ selectedEvent.locationName }}</q-item-label>
                            </q-item-section>
                        </q-item>

                        <q-item>
                            <q-item-section>
                                <q-item-label caption>Дата и время</q-item-label>
                                <q-item-label>{{ formatDateTime(selectedEvent.timestamp) }}</q-item-label>
                            </q-item-section>
                        </q-item>

                        <q-item>
                            <q-item-section>
                                <q-item-label caption>Координаты</q-item-label>
                                <q-item-label>
                                    {{ selectedEvent.lat.toFixed(6) }}, {{ selectedEvent.lng.toFixed(6) }}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Закрыть" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAdminEventsStore } from 'src/stores/adminEventsStore'
import { useAdminLocationStore } from 'src/stores/adminLocationStore'
import { useEmployeesStore } from 'src/stores/employeesStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const eventsStore = useAdminEventsStore()
const locationStore = useAdminLocationStore()
const employeesStore = useEmployeesStore()

const filteredEvents = ref([])
const showDetailsDialog = ref(false)
const selectedEvent = ref(null)

onMounted(async () => {
    await Promise.all([
        locationStore.fetchLocations(),
        employeesStore.fetchEmployees(),
        eventsStore.fetchEvents()
    ])
    await applyFilters()
})

const filters = reactive({
    dateFrom: null,
    dateTo: null,
    type: null,
    locationId: null,
    employeeId: null
})

const pagination = ref({
    sortBy: 'timestamp',
    descending: true,
    page: 1,
    rowsPerPage: 10
})

const columns = [
    {
        name: 'id',
        label: 'ID',
        field: 'id',
        sortable: true,
        align: 'left'
    },
    {
        name: 'employeeName',
        label: 'Сотрудник',
        field: 'employeeName',
        sortable: true,
        align: 'left'
    },
    {
        name: 'type',
        label: 'Тип',
        field: 'type',
        sortable: true,
        align: 'center'
    },
    {
        name: 'locationName',
        label: 'Точка',
        field: 'locationName',
        sortable: true,
        align: 'left'
    },
    {
        name: 'timestamp',
        label: 'Дата и время',
        field: 'timestamp',
        sortable: true,
        align: 'left'
    },
    {
        name: 'actions',
        label: 'Действия',
        align: 'center'
    }
]

const typeOptions = [
    { label: 'Вход', value: 'check_in' },
    { label: 'Выход', value: 'check_out' }
]

const locationOptions = computed(() => {
    return locationStore.locations.map(loc => ({
        label: loc.name,
        value: loc.id
    }))
})

const employeeOptions = computed(() => {
    return employeesStore.employees.map(emp => ({
        label: emp.name,
        value: emp.id
    }))
})

const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const applyFilters = async () => {
    filteredEvents.value = await eventsStore.fetchEvents(filters)
}

const resetFilters = () => {
    filters.dateFrom = null
    filters.dateTo = null
    filters.type = null
    filters.locationId = null
    filters.employeeId = null
    applyFilters()
}

const viewDetails = (event) => {
    selectedEvent.value = event
    showDetailsDialog.value = true
}

const exportToCSV = () => {
    if (filteredEvents.value.length === 0) {
        $q.notify({
            type: 'warning',
            message: 'Нет данных для экспорта',
            position: 'top'
        })
        return
    }

    const headers = ['ID', 'Сотрудник', 'Тип', 'Точка', 'Дата и время', 'Широта', 'Долгота']
    const rows = filteredEvents.value.map(event => [
        event.id,
        event.employeeName,
        event.type === 'check_in' ? 'Вход' : 'Выход',
        event.locationName,
        formatDateTime(event.timestamp),
        event.lat,
        event.lng
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `events_${Date.now()}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    $q.notify({
        type: 'positive',
        message: 'CSV файл успешно экспортирован',
        position: 'top'
    })
}

const onRequest = (props) => {
    pagination.value = props.pagination
}
</script>