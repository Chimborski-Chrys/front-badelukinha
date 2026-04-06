<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { mdiAlertCircle, mdiGoogle } from '@mdi/js'
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { GoogleSignInButton } from 'vue3-google-signin'

const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref(null)
const isLoading = ref(false)

const handleGoogleSuccess = async (response) => {
  const { credential } = response
  errorMessage.value = null
  isLoading.value = true
  try {
    const apiResponse = await api.post('/Auth/google', {
      idToken: credential
    })
    
    const { token, usuario } = apiResponse.data
    authStore.setAuth(usuario, token)
    
    if (authStore.isSuperAdmin || authStore.isCostureira) {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Falha no login Google:', error)
    if (error.response && error.response.status === 403) {
      errorMessage.value = error.response.data.message || 'Sua conta aguarda ativação por um administrador.'
    } else {
      errorMessage.value = 'Falha ao autenticar com Google. Verifique se você tem permissão de acesso.'
    }
    authStore.clearAuth()
  } finally {
    isLoading.value = false
  }
}

const handleGoogleError = () => {
  errorMessage.value = 'Erro ao conectar com Google. Tente novamente mais tarde.'
}
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="slate">
      <CardBox :class="cardClass" class="rounded-3xl shadow-2xl border-none p-10">
        <div class="text-center mb-10">
          <h1 class="text-3xl font-black text-slate-800">Badelukinha</h1>
          <p class="text-slate-500 text-sm mt-2 font-medium">Painel Administrativo</p>
        </div>

        <NotificationBar v-if="errorMessage" color="danger" :icon="mdiAlertCircle" class="mb-6">
          {{ errorMessage }}
        </NotificationBar>

        <div class="flex flex-col items-center justify-center space-y-8 py-6">
          <div class="bg-indigo-50 p-6 rounded-full mb-2">
            <svg class="w-12 h-12 text-indigo-600" viewBox="0 0 24 24">
              <path fill="currentColor" :d="mdiGoogle" />
            </svg>
          </div>
          
          <div class="text-center">
            <h2 class="text-xl font-bold text-slate-700">Acesso Restrito</h2>
            <p class="text-slate-400 text-sm mt-1">Utilize sua conta Google para entrar</p>
          </div>

          <div v-if="isLoading" class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p class="mt-4 text-sm text-slate-500 font-medium">Autenticando...</p>
          </div>

          <div v-else class="transform scale-110 hover:scale-115 transition-transform duration-300">
            <GoogleSignInButton
              type="standard"
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="pill"
              @success="handleGoogleSuccess"
              @error="handleGoogleError"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-center mt-6">
            <BaseButton to="/" color="info" outline label="Voltar para a Vitrine" class="border-none hover:bg-slate-100" />
          </div>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
