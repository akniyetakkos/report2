const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms))
const shouldFail = () => Math.random() < 0.05

const mockDB = {
  userStatus: 'idle', 
  currentLocation: null,
  checkInHistory: []
}
export async function checkIn(data) {
  await delay()

  if (shouldFail()) {
    throw new Error('Ошибка сети. Попробуйте еще раз.')
  }

  if (mockDB.userStatus === 'checked_in') {
    throw new Error('Вы уже зарегистрированы на работе')
  }

  const record = {
    id: Date.now(),
    type: 'check_in',
    lat: data.lat,
    lng: data.lng,
    timestamp: data.timestamp || new Date().toISOString(),
    locationName: data.locationName || 'Рабочая точка',
    success: true
  }

  mockDB.userStatus = 'checked_in'
  mockDB.currentLocation = data.locationName
  mockDB.checkInHistory.push(record)

  console.log('✅ Check-In успешно:', record)

  return {
    success: true,
    message: 'Вход зарегистрирован',
    data: record
  }
}

export async function checkOut(data) {
  await delay()

  if (shouldFail()) {
    throw new Error('Ошибка сети. Попробуйте еще раз.')
  }

  if (mockDB.userStatus !== 'checked_in') {
    throw new Error('Вы не зарегистрированы на работе')
  }

  const record = {
    id: Date.now(),
    type: 'check_out',
    lat: data.lat,
    lng: data.lng,
    timestamp: data.timestamp || new Date().toISOString(),
    locationName: data.locationName || 'Рабочая точка',
    success: true
  }

  mockDB.userStatus = 'checked_out'
  mockDB.currentLocation = null
  mockDB.checkInHistory.push(record)

  console.log('✅ Check-Out успешно:', record)

  return {
    success: true,
    message: 'Выход зарегистрирован',
    data: record
  }
}

export async function getStatus() {
  await delay(300)

  if (shouldFail()) {
    throw new Error('Ошибка при получении статуса')
  }

  const lastCheckIn = mockDB.checkInHistory
    .filter(r => r.type === 'check_in')
    .slice(-1)[0]

  return {
    success: true,
    status: mockDB.userStatus,
    location: mockDB.currentLocation,
    lastCheckIn: lastCheckIn || null,
    history: mockDB.checkInHistory.slice(-10)
  }
}

export async function getHistory(filters = {}) {
  await delay(500)

  let history = [...mockDB.checkInHistory]

  if (filters.dateFrom) {
    history = history.filter(r => new Date(r.timestamp) >= new Date(filters.dateFrom))
  }

  if (filters.dateTo) {
    history = history.filter(r => new Date(r.timestamp) <= new Date(filters.dateTo))
  }

  if (filters.type) {
    history = history.filter(r => r.type === filters.type)
  }

  return {
    success: true,
    data: history.reverse(),
    total: history.length
  }
}

export function resetMockDB() {
  mockDB.userStatus = 'idle'
  mockDB.currentLocation = null
  mockDB.checkInHistory = []
  console.log('🔄 Mock DB сброшена')
}