<template>
    <q-page class="flex flex-center bg-gradient">
        <q-card class="login-card" style="width: 400px">
            <q-card-section class="text-center">
                <div class="text-h4 text-primary q-mb-md">
                    <q-icon name="admin_panel_settings" size="48px" />
                </div>
                <div class="text-h5 text-weight-bold">Административная панель</div>
                <div class="text-subtitle2 text-grey-7">WebCheckIn Service</div>
            </q-card-section>

            <q-card-section>
                <q-form @submit="handleLogin" class="q-gutter-md">
                    <q-input v-model="username" label="Логин" outlined :rules="[val => !!val || 'Введите логин']">
                        <template v-slot:prepend>
                            <q-icon name="person" />
                        </template>
                    </q-input>

                    <q-input v-model="password" label="Пароль" type="password" outlined
                        :rules="[val => !!val || 'Введите пароль']">
                        <template v-slot:prepend>
                            <q-icon name="lock" />
                        </template>
                    </q-input>

                    <div class="q-mt-md">
                        <q-btn type="submit" label="Войти" color="primary" class="full-width" :loading="loading"
                            size="md" />
                    </div>
                </q-form>
            </q-card-section>

            <q-card-section class="text-center text-caption text-grey-6">
                <div>Тестовые данные:</div>
                <div>Логин: <strong>admin</strong></div>
                <div>Пароль: <strong>admin</strong></div>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const username = ref('admin')
const password = ref('admin')
const loading = ref(false)

const handleLogin = async () => {
    loading.value = true

    try {
        await authStore.login({
            username: username.value,
            password: password.value
        })

        $q.notify({
            type: 'positive',
            message: 'Успешный вход в систему',
            position: 'top'
        })

        router.push('/admin/dashboard')
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: error.message || 'Ошибка входа',
            position: 'top'
        })
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.bg-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}
</style>