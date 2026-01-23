import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/authStore'

export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    if (to.meta.requiresAuth !== false && to.path.startsWith('/admin')) {
      if (!authStore.isAuthenticated) {
        if (to.name !== 'admin-login') {
          next({ name: 'admin-login', query: { redirect: to.fullPath } })
          return
        }
      } else {
        if (to.name === 'admin-login') {
          next({ name: 'admin-dashboard' })
          return
        }
      }
    }

    next()
  })

  return Router
})