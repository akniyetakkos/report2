<template>
    <q-page padding>
        <q-card flat bordered>
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
                        <q-td :props="props" class="text-center">
                            <q-chip :color="props.row.type === 'check_in' ? 'green' : 'orange'" text-color="white" dense
                                size="sm">
                                {{ props.row.type === 'check_in' ? 'Вход' : 'Выход' }}
                            </q-chip>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-employeeName="props">
                        <q-td :props="props">
                            <q-btn flat class="q-pa-none text-primary" @click="openDetails(props.row)">
                                {{ props.row.employeeName }}
                            </q-btn>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-timestamp="props">
                        <q-td :props="props">
                            {{ formatDateTime(props.row.timestamp) }}
                        </q-td>
                    </template>

                    <template v-slot:body-cell-actions="props">
                        <q-td :props="props" class="text-center">
                            <q-btn flat round dense icon="visibility" size="sm" @click="openDetails(props.row)">
                                <q-tooltip>Подробнее</q-tooltip>
                            </q-btn>
                        </q-td>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>

    </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminEventsStore } from 'src/stores/adminEventsStore'
import { useAdminLocationStore } from 'src/stores/adminLocationStore'
import { useEmployeesStore } from 'src/stores/employeesStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const eventsStore = useAdminEventsStore()
const locationStore = useAdminLocationStore()
const employeesStore = useEmployeesStore()

const filteredEvents = ref([])

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

const openDetails = (event) => {
    router.push({ name: 'admin-event-details', params: { id: event.id } })
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

const onRequest = (props) => {
    pagination.value = props.pagination
}
</script>