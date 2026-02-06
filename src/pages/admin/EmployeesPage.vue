<template>
    <q-page padding>
        <q-card>
            <q-card-section>
                <div class="row items-center q-mb-md">
                    <div class="col">
                        <div class="text-h6">Сотрудники</div>
                    </div>
                    <div class="col-auto">
                        <q-btn flat round dense icon="refresh" class="q-mr-sm" @click="refreshData"
                            :loading="employeesStore.loading">
                            <q-tooltip>Обновить из Google Sheets</q-tooltip>
                        </q-btn>
                        <q-btn unelevated color="primary" icon="add" label="Добавить сотрудника"
                            @click="openCreateDialog" />
                    </div>
                </div>

                <q-banner v-if="employeesStore.error" class="bg-warning text-white q-mb-md" dense rounded>
                    <template v-slot:avatar>
                        <q-icon name="warning" />
                    </template>
                    {{ employeesStore.error }}
                </q-banner>
                <q-table :rows="employeesStore.employees" :columns="columns" row-key="id"
                    :loading="employeesStore.loading" :pagination="pagination" flat bordered>
                    <template v-slot:body-cell-status="props">
                        <q-td :props="props">
                            <q-chip :color="getEmployeeStatus(props.row.id) === 'working' ? 'green' : 'grey'"
                                text-color="white" dense size="sm">
                                {{ getEmployeeStatus(props.row.id) === 'working' ? 'На работе' : 'Не на работе' }}
                            </q-chip>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-locations="props">
                        <q-td :props="props">
                            <q-chip v-for="locId in props.row.assignedLocations" :key="locId" size="sm" dense
                                color="blue-1">
                                {{ getLocationName(locId) }}
                            </q-chip>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-actions="props">
                        <q-td :props="props">
                            <q-btn flat round dense icon="history" size="sm" @click="viewHistory(props.row)">
                                <q-tooltip>История регистраций</q-tooltip>
                            </q-btn>
                            <q-btn flat round dense icon="edit" size="sm" @click="openEditDialog(props.row)">
                                <q-tooltip>Редактировать</q-tooltip>
                            </q-btn>
                            <q-btn flat round dense icon="delete" size="sm" color="negative"
                                @click="confirmDelete(props.row)">
                                <q-tooltip>Удалить</q-tooltip>
                            </q-btn>
                        </q-td>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>

        <q-dialog v-model="showDialog" persistent>
            <q-card style="min-width: 500px">
                <q-card-section>
                    <div class="text-h6">
                        {{ editMode ? 'Редактировать сотрудника' : 'Новый сотрудник' }}
                    </div>
                </q-card-section>

                <q-card-section>
                    <q-form @submit="handleSubmit" class="q-gutter-md">
                        <q-input v-model="formData.name" label="ФИО *" outlined
                            :rules="[val => !!val || 'Обязательное поле']" />

                        <q-input v-model="formData.email" label="Email *" type="email" outlined :rules="[
                            val => !!val || 'Обязательное поле',
                            val => /.+@.+\..+/.test(val) || 'Неверный формат email'
                        ]" />

                        <q-input v-model="formData.phone" label="Телефон *" outlined mask="+7 ### ### ####"
                            :rules="[val => !!val || 'Обязательное поле']" />

                        <q-input v-model="formData.position" label="Должность *" outlined
                            :rules="[val => !!val || 'Обязательное поле']" />

                        <q-select v-model="formData.assignedLocations" :options="locationOptions"
                            label="Рабочие точки *" outlined multiple emit-value map-options
                            :rules="[val => val && val.length > 0 || 'Выберите хотя бы одну точку']" />
                    </q-form>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Отмена" color="grey-7" v-close-popup />
                    <q-btn unelevated :label="editMode ? 'Сохранить' : 'Создать'" color="primary" @click="handleSubmit"
                        :loading="loading" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <q-dialog v-model="showHistoryDialog" full-width>
            <q-card style="max-width: 900px">
                <q-card-section>
                    <div class="text-h6">
                        История регистраций: {{ selectedEmployee?.name }}
                    </div>
                </q-card-section>

                <q-card-section>
                    <q-list separator v-if="employeeHistory.length > 0">
                        <q-item v-for="event in employeeHistory" :key="event.id">
                            <q-item-section avatar>
                                <q-avatar :color="event.type === 'check_in' ? 'green' : 'orange'" text-color="white"
                                    :icon="event.type === 'check_in' ? 'login' : 'logout'" />
                            </q-item-section>

                            <q-item-section>
                                <q-item-label>{{ event.locationName }}</q-item-label>
                                <q-item-label caption>
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
                        Нет регистраций
                    </div>
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
import { useQuasar } from 'quasar'
import { useEmployeesStore } from 'src/stores/employeesStore'
import { useAdminLocationStore } from 'src/stores/adminLocationStore'
import { useAdminEventsStore } from 'src/stores/adminEventsStore'

const $q = useQuasar()
const employeesStore = useEmployeesStore()
const locationStore = useAdminLocationStore()
const eventsStore = useAdminEventsStore()

const showDialog = ref(false)
const showHistoryDialog = ref(false)
const editMode = ref(false)
const loading = ref(false)
const selectedEmployee = ref(null)
const employeeHistory = ref([])

const pagination = ref({
    sortBy: 'name',
    descending: false,
    page: 1,
    rowsPerPage: 10
})

const formData = reactive({
    name: '',
    email: '',
    phone: '',
    position: '',
    assignedLocations: []
})

const columns = [
    {
        name: 'name',
        label: 'ФИО',
        field: 'name',
        sortable: true,
        align: 'left'
    },
    {
        name: 'email',
        label: 'Email',
        field: 'email',
        sortable: true,
        align: 'left'
    },
    {
        name: 'phone',
        label: 'Телефон',
        field: 'phone',
        align: 'left'
    },
    {
        name: 'position',
        label: 'Должность',
        field: 'position',
        sortable: true,
        align: 'left'
    },
    {
        name: 'locations',
        label: 'Рабочие точки',
        field: 'assignedLocations',
        align: 'left'
    },
    {
        name: 'status',
        label: 'Статус',
        align: 'center'
    },
    {
        name: 'actions',
        label: 'Действия',
        align: 'center'
    }
]

const locationOptions = computed(() => {
    return locationStore.locations.map(loc => ({
        label: loc.name,
        value: loc.id
    }))
})

const getLocationName = (locationId) => {
    const location = locationStore.locations.find(loc => loc.id === locationId)
    return location ? location.name : 'Неизвестно'
}

const getEmployeeStatus = (employeeId) => {
    const activeEmps = eventsStore.getActiveEmployees()
    return activeEmps.some(emp => emp.employeeId === employeeId) ? 'working' : 'not_working'
}

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

const resetForm = () => {
    formData.name = ''
    formData.email = ''
    formData.phone = ''
    formData.position = ''
    formData.assignedLocations = []
}

const openCreateDialog = () => {
    resetForm()
    editMode.value = false
    showDialog.value = true
}

const openEditDialog = (employee) => {
    editMode.value = true
    formData.name = employee.name
    formData.email = employee.email
    formData.phone = employee.phone
    formData.position = employee.position
    formData.assignedLocations = [...employee.assignedLocations]
    selectedEmployee.value = employee
    showDialog.value = true
}

const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.position) {
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
            await employeesStore.updateEmployee(selectedEmployee.value.id, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                position: formData.position,
                assignedLocations: formData.assignedLocations
            })
            $q.notify({
                type: 'positive',
                message: 'Сотрудник успешно обновлен',
                position: 'top'
            })
        } else {
            await employeesStore.createEmployee({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                position: formData.position,
                assignedLocations: formData.assignedLocations
            })
            $q.notify({
                type: 'positive',
                message: 'Сотрудник успешно создан',
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

const confirmDelete = (employee) => {
    $q.dialog({
        title: 'Подтверждение',
        message: `Удалить сотрудника "${employee.name}"?`,
        cancel: true,
        persistent: true
    }).onOk(async () => {
        try {
            await employeesStore.deleteEmployee(employee.id)
            $q.notify({
                type: 'positive',
                message: 'Сотрудник удален',
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

const viewHistory = (employee) => {
    selectedEmployee.value = employee
    employeeHistory.value = eventsStore.getEmployeeEvents(employee.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    showHistoryDialog.value = true
}

const refreshData = async () => {
    await Promise.all([
        employeesStore.fetchEmployees(),
        locationStore.fetchLocations(),
        eventsStore.fetchEvents()
    ])
}

onMounted(async () => {
    await refreshData()
})
</script>