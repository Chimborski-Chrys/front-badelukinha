<script setup>
import { reactive } from 'vue'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { mdiAccountPlus, mdiAt, mdiLock, mdiWhatsapp, mdiAccountGroup } from '@mdi/js'
import api from '@/services/api'
import { ref } from 'vue'

const form = reactive({
  nome: '',
  email: '',
  senha: '',
  telefoneWhatsApp: '',
  nomeMarca: ''
})

const notification = ref({
  show: false,
  color: 'info',
  message: ''
})

const submit = async () => {
  notification.value.show = false
  try {
    await api.post('/admin/costureiras', form) // Endpoint para criar costureira
    notification.value = {
      show: true,
      color: 'success',
      message: 'Costureira criada com sucesso!'
    }
    // Limpar formulário
    Object.assign(form, { nome: '', email: '', senha: '', telefoneWhatsApp: '', nomeMarca: '' })
  } catch (error) {
    console.error('Erro ao criar costureira:', error)
    notification.value = {
      show: true,
      color: 'danger',
      message: error.response?.data?.message || 'Erro ao criar costureira.'
    }
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiAccountPlus" title="Criar Nova Costureira" main />

      <NotificationBar
        v-if="notification.show"
        :color="notification.color"
        @close="notification.show = false"
      >
        {{ notification.message }}
      </NotificationBar>

      <CardBox is-form @submit.prevent="submit">
        <FormField label="Nome Completo">
          <FormControl v-model="form.nome" :icon="mdiAccountGroup" name="nome" required />
        </FormField>

        <FormField label="Email">
          <FormControl v-model="form.email" :icon="mdiAt" type="email" name="email" required />
        </FormField>
        
        <FormField label="Senha Provisória">
          <FormControl v-model="form.senha" :icon="mdiLock" type="password" name="senha" required />
        </FormField>

        <FormField label="Telefone (WhatsApp)">
          <FormControl v-model="form.telefoneWhatsApp" :icon="mdiWhatsapp" name="telefone" required />
        </FormField>

        <FormField label="Nome da Marca/Ateliê">
          <FormControl v-model="form.nomeMarca" name="nomeMarca" />
        </FormField>

        <template #footer>
          <BaseButtons>
            <BaseButton type="submit" color="info" label="Criar Costureira" />
            <BaseButton type="reset" color="info" outline label="Limpar" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
