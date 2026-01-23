import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEmployeesStore = defineStore('employees', () => {
  const employees = ref([
    {
      id: 101,
      name: 'Иванов Иван',
      email: 'ivanov@example.kz',
      phone: '+7 701 234 5678',
      position: 'Менеджер',
      assignedLocations: [1],
      active: true,
      createdAt: '2025-01-10T09:00:00Z'
    },
    {
      id: 102,
      name: 'Петрова Мария',
      email: 'petrova@example.kz',
      phone: '+7 702 345 6789',
      position: 'Специалист',
      assignedLocations: [1],
      active: true,
      createdAt: '2025-01-12T10:30:00Z'
    },
    {
      id: 103,
      name: 'Сидоров Петр',
      email: 'sidorov@example.kz',
      phone: '+7 707 456 7890',
      position: 'Кладовщик',
      assignedLocations: [2],
      active: true,
      createdAt: '2025-01-15T11:00:00Z'
    }
  ])

  const loading = ref(false)
  const error = ref(null)

  async function fetchEmployees() {
    loading.value = true
    error.value = null
    
    return new Promise((resolve) => {
      setTimeout(() => {
        loading.value = false
        resolve(employees.value)
      }, 500)
    })
  }

  async function createEmployee(employeeData) {
    loading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const newEmployee = {
            id: Date.now(),
            ...employeeData,
            active: true,
            createdAt: new Date().toISOString()
          }
          employees.value.push(newEmployee)
          loading.value = false
          resolve(newEmployee)
        } catch (err) {
          error.value = err.message
          loading.value = false
          reject(err)
        }
      }, 600)
    })
  }

  async function updateEmployee(id, updates) {
    loading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = employees.value.findIndex(emp => emp.id === id)
        if (index !== -1) {
          employees.value[index] = { 
            ...employees.value[index], 
            ...updates 
          }
          loading.value = false
          resolve(employees.value[index])
        } else {
          error.value = 'Сотрудник не найден'
          loading.value = false
          reject(new Error('Сотрудник не найден'))
        }
      }, 500)
    })
  }

  async function deleteEmployee(id) {
    loading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = employees.value.findIndex(emp => emp.id === id)
        if (index !== -1) {
          employees.value.splice(index, 1)
          loading.value = false
          resolve(true)
        } else {
          error.value = 'Сотрудник не найден'
          loading.value = false
          reject(new Error('Сотрудник не найден'))
        }
      }, 500)
    })
  }

  function getEmployeeById(id) {
    return employees.value.find(emp => emp.id === id)
  }

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById
  }
})