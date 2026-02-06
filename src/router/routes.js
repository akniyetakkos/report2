
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'home',
        component: () => import('pages/IndexPage.vue') 
      }
    ]
  },

  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'login',
        name: 'admin-login',
        component: () => import('pages/admin/LoginPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('pages/admin/DashboardPage.vue')
      },
      {
        path: 'locations',
        name: 'admin-locations',
        component: () => import('pages/admin/LocationsPage.vue')
      },
      {
        path: 'events',
        name: 'admin-events',
        component: () => import('pages/admin/EventsPage.vue')
      },
      {
        path: 'events/:id',
        name: 'admin-event-details',
        component: () => import('pages/admin/EventDetailsPage.vue')
      },
      {
        path: 'employees',
        name: 'admin-employees',
        component: () => import('pages/admin/EmployeesPage.vue')
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('pages/admin/SettingsPage.vue')
      },
      
    ]
  },

  // 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes 