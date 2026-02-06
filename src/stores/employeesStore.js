import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchEmployeesFromSheet,
  addEmployeeToSheet,
  updateEmployeeInSheet,
  deleteEmployeeFromSheet
} from 'src/services/googleSheetsService'

export const useEmployeesStore = defineStore('employees', () => {
  const employees = ref([
    {
      id: 101,
      name: 'Иванов Иван',
      email: 'ivanov@example.com',
      phone: '+7 700 111 2233',
      position: 'Менеджер',
      assignedLocations: [1]
    },
    {
      id: 102,
      name: 'Петрова Мария',
      email: 'petrova@example.com',
      phone: '+7 700 222 3344',
      position: 'Бухгалтер',
      assignedLocations: [1]
    },
    {
      id: 103,
      name: 'Сидоров Петр',
      email: 'sidorov@example.com',
      phone: '+7 700 333 4455',
      position: 'Кладовщик',
      assignedLocations: [2]
    }
  ])

  const loading = ref(false)
  const error = ref(null)

  function upsertLocal(employee) {
    const idx = employees.value.findIndex((e) => e.id === employee.id)
    if (idx === -1) {
      employees.value.push(employee)
    } else {
      employees.value[idx] = employee
    }
  }

  async function fetchEmployees() {
    loading.value = true
    error.value = null

    try {
      const sheetEmployees = await fetchEmployeesFromSheet()
      if (Array.isArray(sheetEmployees)) employees.value = sheetEmployees
      return employees.value
    } catch (err) {
      // Если Google Sheets не настроен или упал — работаем на локальных мок‑данных
      console.warn('Не удалось загрузить сотрудников из Google Sheets:', err)
      error.value = err.message
      return employees.value
    } finally {
      loading.value = false
    }
  }

  async function createEmployee(employeeData) {
    const localEmployee = {
      id: Date.now(),
      ...employeeData
    }

    try {
      const created = await addEmployeeToSheet(localEmployee)
      const finalEmployee = created || localEmployee
      // Перечитываем из таблицы, чтобы сайт сразу совпадал с Google Sheets
      try {
        await fetchEmployees()
      } catch {
        upsertLocal(finalEmployee)
      }
      return finalEmployee
    } catch (err) {
      console.warn('Не удалось сохранить сотрудника в Google Sheets, сохраняем только локально:', err)
      error.value = err.message
      upsertLocal(localEmployee)
      return localEmployee
    }
  }

  async function updateEmployee(id, updates) {
    const index = employees.value.findIndex((e) => e.id === id)
    if (index === -1) {
      throw new Error('Сотрудник не найден')
    }

    const updatedLocal = {
      ...employees.value[index],
      ...updates
    }

    try {
      const updatedRemote = await updateEmployeeInSheet(id, updates)
      const finalEmployee = updatedRemote || updatedLocal
      employees.value[index] = finalEmployee
      // Перечитываем из таблицы, чтобы изменения в Google Sheets сразу отражались на сайте
      try {
        await fetchEmployees()
      } catch {
        // ignore
      }
      return finalEmployee
    } catch (err) {
      console.warn('Не удалось обновить сотрудника в Google Sheets, обновляем только локально:', err)
      error.value = err.message
      employees.value[index] = updatedLocal
      return updatedLocal
    }
  }

  async function deleteEmployee(id) {
    const before = employees.value.length
    employees.value = employees.value.filter((e) => e.id !== id)
    if (employees.value.length === before) {
      throw new Error('Сотрудник не найден')
    }

    try {
      await deleteEmployeeFromSheet(id)
      // Перечитываем, чтобы синхронизировать с таблицей
      try {
        await fetchEmployees()
      } catch {
        // ignore
      }
      return true
    } catch (err) {
      console.warn('Не удалось удалить сотрудника из Google Sheets, удалён только локально:', err)
      error.value = err.message
      return true
    }
  }

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
  }
})


