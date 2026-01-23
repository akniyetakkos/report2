import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminEventsStore = defineStore('adminEvents', () => {
  const events = ref([
    {
      id: 1,
      employeeId: 101,
      employeeName: 'Иванов Иван',
      locationId: 1,
      locationName: 'Офис Астана',
      type: 'check_in',
      timestamp: '2025-01-23T08:30:00Z',
      lat: 51.1282,
      lng: 71.4306
    },
    {
      id: 2,
      employeeId: 102,
      employeeName: 'Петрова Мария',
      locationId: 1,
      locationName: 'Офис Астана',
      type: 'check_in',
      timestamp: '2025-01-23T08:45:00Z',
      lat: 51.1283,
      lng: 71.4307
    },
    {
      id: 3,
      employeeId: 101,
      employeeName: 'Иванов Иван',
      locationId: 1,
      locationName: 'Офис Астана',
      type: 'check_out',
      timestamp: '2025-01-23T17:30:00Z',
      lat: 51.1282,
      lng: 71.4306
    },
    {
      id: 4,
      employeeId: 103,
      employeeName: 'Сидоров Петр',
      locationId: 2,
      locationName: 'Склад №1',
      type: 'check_in',
      timestamp: '2025-01-23T09:00:00Z',
      lat: 51.1150,
      lng: 71.4200
    }
  ])

  const loading = ref(false)
  const error = ref(null)

  async function fetchEvents(filters = {}) {
    loading.value = true
    error.value = null

    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...events.value]

        if (filters.dateFrom) {
          filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(filters.dateFrom))
        }
        if (filters.dateTo) {
          filtered = filtered.filter(e => new Date(e.timestamp) <= new Date(filters.dateTo))
        }

        if (filters.employeeId) {
          filtered = filtered.filter(e => e.employeeId === filters.employeeId)
        }
        if (filters.locationId) {
          filtered = filtered.filter(e => e.locationId === filters.locationId)
        }

        if (filters.type) {
          filtered = filtered.filter(e => e.type === filters.type)
        }

        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

        loading.value = false
        resolve(filtered)
      }, 500)
    })
  }

  async function addEvent(eventData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newEvent = {
          id: Date.now(),
          ...eventData,
          timestamp: new Date().toISOString()
        }
        events.value.unshift(newEvent)
        resolve(newEvent)
      }, 300)
    })
  }

  function getEventById(id) {
    return events.value.find(e => e.id === id)
  }

  function getEmployeeEvents(employeeId) {
    return events.value.filter(e => e.employeeId === employeeId)
  }

  function getTodayEvents() {
    const today = new Date().toDateString()
    return events.value.filter(e => 
      new Date(e.timestamp).toDateString() === today
    )
  }

  function getActiveEmployees() {
    const today = new Date().toDateString()
    const todayEvents = events.value.filter(e => 
      new Date(e.timestamp).toDateString() === today
    )

    const employeeStatus = new Map()
    
    todayEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    
    todayEvents.forEach(event => {
      employeeStatus.set(event.employeeId, {
        employeeId: event.employeeId,
        employeeName: event.employeeName,
        status: event.type === 'check_in' ? 'working' : 'left',
        locationName: event.locationName,
        lastEvent: event.timestamp
      })
    })

    return Array.from(employeeStatus.values()).filter(emp => emp.status === 'working')
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    addEvent,
    getEventById,
    getEmployeeEvents,
    getTodayEvents,
    getActiveEmployees
  }
})