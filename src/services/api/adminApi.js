const initMockData = () => {
  const storageKey = 'admin_locations'
  if (!localStorage.getItem(storageKey)) {
    const initialLocations = [
      {
        id: 1,
        name: 'Офис Астана',
        address: 'Syganak street, 17/10, Astana, 010000, Kazakhstan',
        lat: 51.091944,
        lng: 71.415556,
        radius: 100,
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Склад №1',
        address: 'Industrial district, Astana, Kazakhstan',
        lat: 51.1150,
        lng: 71.4200,
        radius: 150,
        active: true,
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(storageKey, JSON.stringify(initialLocations))
  }
}
initMockData()
const mockApi = {
  get: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 300)) 
    
    if (url === '/locations') {
      const data = JSON.parse(localStorage.getItem('admin_locations') || '[]')
      return { data }
    }
    
    throw new Error(`GET ${url} not implemented`)
  },

  post: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (url === '/locations') {
      const locations = JSON.parse(localStorage.getItem('admin_locations') || '[]')
      const newLocation = {
        id: Date.now(),
        ...data,
        active: data.active !== undefined ? data.active : true,
        createdAt: new Date().toISOString()
      }
      locations.push(newLocation)
      localStorage.setItem('admin_locations', JSON.stringify(locations))
      return { data: newLocation }
    }
    
    throw new Error(`POST ${url} not implemented`)
  },

  put: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const match = url.match(/^\/locations\/(\d+)$/)
    if (match) {
      const id = parseInt(match[1])
      const locations = JSON.parse(localStorage.getItem('admin_locations') || '[]')
      const index = locations.findIndex(loc => loc.id === id)
      
      if (index === -1) {
        throw new Error('Location not found')
      }
      
      locations[index] = {
        ...locations[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('admin_locations', JSON.stringify(locations))
      return { data: locations[index] }
    }
    
    throw new Error(`PUT ${url} not implemented`)
  },

  delete: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const match = url.match(/^\/locations\/(\d+)$/)
    if (match) {
      const id = parseInt(match[1])
      const locations = JSON.parse(localStorage.getItem('admin_locations') || '[]')
      const filtered = locations.filter(loc => loc.id !== id)
      
      if (filtered.length === locations.length) {
        throw new Error('Location not found')
      }
      
      localStorage.setItem('admin_locations', JSON.stringify(filtered))
      return { data: { success: true } }
    }
    
    throw new Error(`DELETE ${url} not implemented`)
  }
}

const api = mockApi

export default api