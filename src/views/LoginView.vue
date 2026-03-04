<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mdiAccount, mdiAsterisk, mdiAlertCircle } from '@mdi/js'
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { GoogleSignInButton } from 'vue3-google-signin'

const form = reactive({
  email: 'costureira1@email.com', // Valor de exemplo
  senha: 'password123', // Valor de exemplo
  remember: true,
})

const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref(null)

const submit = async () => {
  errorMessage.value = null // Limpa erros anteriores
  try {
    const response = await api.post('/Auth/login', {
      email: form.email,
      senha: form.senha,
    })

    const { token, usuario } = response.data

    if (!usuario.ativo) {
      errorMessage.value = 'Usuário inativo. Por favor, entre em contato com o suporte.'
      authStore.clearAuth()
      return
    }

    authStore.setAuth(usuario, token)

    // Redirecionamento condicional
    if (authStore.isSuperAdmin) {
      router.push('/admin/dashboard') // Nova rota para o super admin
    } else {
      router.push('/dashboard') // Rota para o dashboard da costureira
    }
  } catch (error) {
    console.error('Falha no login:', error)
    errorMessage.value = 'Email ou senha invÃ¡lidos. Por favor, tente novamente.'
    authStore.clearAuth() // Garante que qualquer estado de auth antigo seja limpo
  }
}

const handleGoogleSuccess = async (response) => {
  const { credential } = response
  errorMessage.value = null
  try {
    const apiResponse = await api.post('/Auth/google', {
      idToken: credential
    })
    
    const { token, usuario } = apiResponse.data
    authStore.setAuth(usuario, token)
    
    if (authStore.isSuperAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Falha no login Google:', error)
    if (error.response && error.response.status === 403) {
      errorMessage.value = error.response.data.message || 'Sua conta aguarda ativação por um administrador.'
    } else {
      errorMessage.value = 'Falha ao autenticar com Google. Tente novamente.'
    }
    authStore.clearAuth()
  }
}

const handleGoogleError = () => {
  errorMessage.value = 'Erro ao conectar com Google.'
}
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="slate">
      <CardBox :class="cardClass" is-form class="rounded-3xl shadow-2xl border-none" @submit.prevent="submit">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-black text-slate-800">Acesse sua conta</h1>
          <p class="text-slate-500 text-sm mt-1">Gerencie seu ateliê e conecte-se com clientes.</p>
        </div>

        <NotificationBar v-if="errorMessage" color="danger" :icon="mdiAlertCircle">
          {{ errorMessage }}
        </NotificationBar>

        <FormField label="Email" help="Por favor, insira seu email">
          <FormControl
            v-model="form.email"
            :icon="mdiAccount"
            name="login"
            autocomplete="username"
          />
        </FormField>

        <FormField label="Senha" help="Por favor, insira sua senha">
          <FormControl
            v-model="form.senha"
            :icon="mdiAsterisk"
            type="password"
            name="password"
            autocomplete="current-password"
          />
        </FormField>

        <FormCheckRadio
          v-model="form.remember"
          name="remember"
          label="Lembrar-me"
          :input-value="true"
        />

        <template #footer>
          <div class="flex flex-col space-y-4 w-full">
            <BaseButtons>
              <BaseButton type="submit" color="info" label="Login" />
              <BaseButton to="/" color="info" outline label="Voltar" />
            </BaseButtons>

            <div class="flex items-center justify-center w-full">
              <div class="border-t border-gray-300 flex-grow mr-3"></div>
              <span class="text-gray-500 text-xs font-semibold">OU</span>
              <div class="border-t border-gray-300 flex-grow ml-3"></div>
            </div>

            <div class="flex justify-center">
              <GoogleSignInButton
                @success="handleGoogleSuccess"
                @error="handleGoogleError"
              />
            </div>
          </div>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
