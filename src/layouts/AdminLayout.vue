<template>
    <q-layout view="hHh lpR fFf">
        <q-header elevated class="bg-primary text-white">
            <q-toolbar>
                <q-btn dense flat round icon="menu" @click="drawer = !drawer" />

                <q-toolbar-title>
                    WebCheckIn Admin
                </q-toolbar-title>

                <q-btn flat round dense icon="account_circle">
                    <q-menu>
                        <q-list style="min-width: 200px">
                            <q-item>
                                <q-item-section>
                                    <q-item-label>{{ authStore.user?.name }}</q-item-label>
                                    <q-item-label caption>{{ authStore.user?.username }}</q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-separator />
                            <q-item clickable v-close-popup @click="handleLogout">
                                <q-item-section avatar>
                                    <q-icon name="logout" />
                                </q-item-section>
                                <q-item-section>Выход</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </q-toolbar>
        </q-header>

        <q-drawer v-model="drawer" show-if-above :width="250" :breakpoint="500" elevated>
            <q-scroll-area class="fit">
                <q-list>
                    <q-item-label header>Навигация</q-item-label>

                    <q-item clickable :active="$route.name === 'admin-dashboard'" active-class="bg-blue-1 text-primary"
                        @click="$router.push('/admin/dashboard')">
                        <q-item-section avatar>
                            <q-icon name="dashboard" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Дашборд</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item clickable :active="$route.name === 'admin-locations'" active-class="bg-blue-1 text-primary"
                        @click="$router.push('/admin/locations')">
                        <q-item-section avatar>
                            <q-icon name="place" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Рабочие точки</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item clickable :active="$route.name === 'admin-events'" active-class="bg-blue-1 text-primary"
                        @click="$router.push('/admin/events')">
                        <q-item-section avatar>
                            <q-icon name="event_note" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Журнал событий</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item clickable :active="$route.name === 'admin-employees'" active-class="bg-blue-1 text-primary"
                        @click="$router.push('/admin/employees')">
                        <q-item-section avatar>
                            <q-icon name="people" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Сотрудники</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-separator class="q-my-md" />

                    <q-item clickable :active="$route.name === 'admin-settings'" active-class="bg-blue-1 text-primary"
                        @click="$router.push('/admin/settings')">
                        <q-item-section avatar>
                            <q-icon name="settings" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Настройки</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item clickable @click="$router.push('/')">
                        <q-item-section avatar>
                            <q-icon name="arrow_back" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>К клиентскому приложению</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-scroll-area>
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const drawer = ref(true)

const handleLogout = () => {
    authStore.logout()
    $q.notify({
        type: 'positive',
        message: 'Вы успешно вышли из системы',
        position: 'top'
    })
    router.push('/admin/login')
}
</script>