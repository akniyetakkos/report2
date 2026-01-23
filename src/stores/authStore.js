import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || null)
  const user = ref(null)
  if (token.value) {
    user.value = {
      id: 1,
      username: 'admin',
      role: 'administrator',
      name: 'Admin User'
    }
  }

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.username === 'admin' && credentials.password === 'admin') {
          const mockToken = 'mock-jwt-token-' + Date.now()
          token.value = mockToken
          user.value = {
            id: 1,
            username: 'admin',
            role: 'administrator',
            name: 'Admin User'
          }
          localStorage.setItem('admin_token', mockToken)
          resolve(user.value)
        } else {
          reject(new Error('Неверный логин или пароль'))
        }
      }, 800)
    })
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('admin_token')
  }

  async function checkAuth() {
    if (token.value) {
      return new Promise((resolve) => {
        setTimeout(() => {
          user.value = {
            id: 1,
            username: 'admin',
            role: 'administrator',
            name: 'Admin User'
          }
          resolve(true)
        }, 300)
      })
    }
    return false
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})