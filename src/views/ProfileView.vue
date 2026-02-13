<script setup>
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { mdiAccount, mdiMail, mdiAsterisk, mdiFormTextboxPassword } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseDivider from '@/components/BaseDivider.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import UserCard from '@/components/UserCard.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import api from '@/services/api'

const authStore = useAuthStore()

const profileForm = reactive({
  nome: '',
  nomeMarca: '',
  email: '',
  sobre: '', // Adicionado o campo "sobre"
})

// Observa o usuário do store e preenche o formulário quando o usuário estiver disponível.
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      profileForm.nome = newUser.nome || ''
      profileForm.nomeMarca = newUser.nomeMarca || ''
      profileForm.email = newUser.email || ''
      profileForm.sobre = newUser.sobre || '' // Preenche o campo "sobre"
    }
  },
  { immediate: true },
)

const passwordForm = reactive({
  senhaAtual: '',
  novaSenha: '',
  confirmarNovaSenha: '',
})

const notification = ref({
  show: false,
  color: 'info',
  message: '',
})

const isUploadingPhoto = ref(false)

const handleFileSelected = async (file) => {
  notification.value.show = false
  isUploadingPhoto.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    const { data } = await api.post('/perfil/foto-perfil', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    authStore.updateUser({ fotoPerfilUrl: data.fotoPerfilUrl })
    notification.value = {
      show: true,
      color: 'success',
      message: 'Foto de perfil atualizada com sucesso!',
    }
  } catch (error) {
    notification.value = {
      show: true,
      color: 'danger',
      message: error.response?.data?.message || 'Erro ao atualizar a foto de perfil.',
    }
  } finally {
    isUploadingPhoto.value = false
  }
}

const salvarPerfil = async () => {
  notification.value.show = false
  try {
    const { data } = await api.put('/perfil', profileForm)
    // Atualiza o store de autenticação com a mesma capitalização
    authStore.updateUser({ nome: profileForm.nome, email: profileForm.email, sobre: profileForm.sobre, nomeMarca: profileForm.nomeMarca })
    notification.value = {
      show: true,
      color: 'success',
      message: data.message || 'Perfil atualizado com sucesso!',
    }
  } catch (error) {
    notification.value = {
      show: true,
      color: 'danger',
      message: error.response?.data?.message || 'Erro ao atualizar perfil.',
    }
  }
}

const salvarSenha = async () => {
  notification.value.show = false
  if (passwordForm.novaSenha !== passwordForm.confirmarNovaSenha) {
    notification.value = { show: true, color: 'danger', message: 'As senhas não conferem.' }
    return
  }
  try {
    const { data } = await api.put('/perfil/senha', passwordForm)
    notification.value = {
      show: true,
      color: 'success',
      message: data.message || 'Senha alterada com sucesso!',
    }
    // Limpar formulário de senha
    Object.assign(passwordForm, { senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' })
  } catch (error) {
    notification.value = {
      show: true,
      color: 'danger',
      message: error.response?.data?.message || 'Erro ao alterar senha.',
    }
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiAccount" title="Meu Perfil" main />

      <NotificationBar
        v-if="notification.show"
        :color="notification.color"
        @close="notification.show = false"
      >
        {{ notification.message }}
      </NotificationBar>

      <UserCard class="mb-6" :loading="isUploadingPhoto" @file-selected="handleFileSelected" />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardBox is-form @submit.prevent="salvarPerfil">
          <FormField label="Nome" help="Obrigatório. Seu nome">
            <FormControl
              v-model="profileForm.nome"
              :icon="mdiAccount"
              name="username"
              required
              autocomplete="username"
            />
          </FormField>
          <FormField label="Nome da Marca" help="O nome público da sua loja/marca">
            <FormControl
              v-model="profileForm.nomeMarca"
              :icon="mdiAccount"
              name="brandname"
              required
              autocomplete="organization"
            />
          </FormField>
          <FormField label="E-mail" help="Obrigatório. Seu e-mail">
            <FormControl
              v-model="profileForm.email"
              :icon="mdiMail"
              type="email"
              name="email"
              required
              autocomplete="email"
            />
          </FormField>
          <FormField label="Sobre a Marca" help="Conte sobre sua marca e seus serviços (máx. 500 caracteres).">
            <FormControl
              v-model="profileForm.sobre"
              type="textarea"
              name="sobre"
              placeholder="Minha marca é..."
              :maxlength="500"
            />
          </FormField>

          <template #footer>
            <BaseButtons>
              <BaseButton color="info" type="submit" label="Salvar Alterações" />
            </BaseButtons>
          </template>
        </CardBox>

        <CardBox is-form @submit.prevent="salvarSenha">
          <FormField label="Senha atual" help="Obrigatório. Sua senha atual">
            <FormControl
              v-model="passwordForm.senhaAtual"
              :icon="mdiAsterisk"
              name="password_current"
              type="password"
              required
              autocomplete="current-password"
            />
          </FormField>

          <BaseDivider />

          <FormField label="Nova senha" help="Obrigatório. Nova senha">
            <FormControl
              v-model="passwordForm.novaSenha"
              :icon="mdiFormTextboxPassword"
              name="password"
              type="password"
              required
              autocomplete="new-password"
            />
          </FormField>

          <FormField label="Confirmar senha" help="Obrigatório. Confirme a nova senha">
            <FormControl
              v-model="passwordForm.confirmarNovaSenha"
              :icon="mdiFormTextboxPassword"
              name="password_confirmation"
              type="password"
              required
              autocomplete="new-password"
            />
          </FormField>

          <template #footer>
            <BaseButtons>
              <BaseButton type="submit" color="info" label="Mudar Senha" />
            </BaseButtons>
          </template>
        </CardBox>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>
