<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mdiAccount, mdiAsterisk } from '@mdi/js'
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
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="purplePink">
      <CardBox :class="cardClass" is-form @submit.prevent="submit">
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
          <BaseButtons>
            <BaseButton type="submit" color="info" label="Login" />
            <BaseButton to="/" color="info" outline label="Voltar" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
