<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { mdiAccount, mdiMail, mdiAsterisk, mdiFormTextboxPassword, mdiWhatsapp, mdiMapMarker, mdiHome, mdiCity, mdiInformation } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseDivider from '@/components/BaseDivider.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import FormCheckRadioGroup from '@/components/FormCheckRadioGroup.vue'
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
  telefoneWhatsApp: '',
  sobre: '',
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  latitude: null,
  longitude: null,
  servicosIds: [],
})

const servicosDisponiveis = ref({})

const fetchServicosDisponiveis = async () => {
  try {
    const { data } = await api.get('/Costureiras/servicos')
    // Converte [{id, nome}] para {id: nome}
    servicosDisponiveis.value = data.reduce((acc, curr) => {
      acc[curr.id] = curr.nome
      return acc
    }, {})
  } catch (error) {
    console.error('Erro ao buscar serviços disponíveis:', error)
  }
}

const fetchProfileData = async () => {
  try {
    const { data } = await api.get('/perfil')
    profileForm.nome = data.nome || ''
    profileForm.nomeMarca = data.nomeMarca || ''
    profileForm.email = data.email || ''
    profileForm.telefoneWhatsApp = data.telefoneWhatsApp || ''
    profileForm.sobre = data.sobre || ''
    profileForm.cep = data.cep || ''
    profileForm.logradouro = data.logradouro || ''
    profileForm.numero = data.numero || ''
    profileForm.bairro = data.bairro || ''
    profileForm.cidade = data.cidade || ''
    profileForm.estado = data.estado || ''
    profileForm.latitude = data.latitude || null
    profileForm.longitude = data.longitude || null
    profileForm.servicosIds = data.servicosIds || []

    // Atualiza o store se necessário para manter consistência
    authStore.updateUser(data)
  } catch (error) {
    console.error('Erro ao buscar dados do perfil:', error)
  }
}

onMounted(() => {
  fetchServicosDisponiveis()
  fetchProfileData()
})

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

const fetchEndereco = async () => {
  if (profileForm.cep?.length === 8) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${profileForm.cep}/json/`)
      const data = await response.json()
      if (!data.erro) {
        profileForm.logradouro = data.logradouro
        profileForm.bairro = data.bairro
        profileForm.cidade = data.localidade
        profileForm.estado = data.uf
        
        // Tentar obter geolocalização por endereço (usando OpenStreetMap/Nominatim)
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${data.logradouro}, ${data.localidade}, ${data.uf}, Brasil`)}`)
        const geoData = await geoResponse.json()
        if (geoData && geoData.length > 0) {
          profileForm.latitude = parseFloat(geoData[0].lat)
          profileForm.longitude = parseFloat(geoData[0].lon)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error)
    }
  }
}

const salvarPerfil = async () => {
  notification.value.show = false
  try {
    const { data } = await api.put('/perfil', profileForm)
    // Atualiza o store de autenticação com a mesma capitalização
    authStore.updateUser({ 
      nome: profileForm.nome, 
      email: profileForm.email, 
      sobre: profileForm.sobre, 
      nomeMarca: profileForm.nomeMarca,
      telefoneWhatsApp: profileForm.telefoneWhatsApp,
      cep: profileForm.cep,
      logradouro: profileForm.logradouro,
      numero: profileForm.numero,
      bairro: profileForm.bairro,
      cidade: profileForm.cidade,
      estado: profileForm.estado,
      latitude: profileForm.latitude,
      longitude: profileForm.longitude,
      servicosIds: profileForm.servicosIds 
    })
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
        <CardBox
          is-form
          :class="{ 'lg:col-span-2': !authStore.user?.hasPassword }"
          @submit.prevent="salvarPerfil"
        >
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
          <FormField label="Telefone WhatsApp" help="Seu número de contato principal">
            <FormControl
              v-model="profileForm.telefoneWhatsApp"
              :icon="mdiWhatsapp"
              name="whatsapp"
              placeholder="(00) 00000-0000"
              autocomplete="tel"
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

          <BaseDivider />

          <!-- Seção de Endereço -->
          <div class="mb-4">
            <div class="flex items-center text-blue-600 mb-2">
              <BaseIcon :path="mdiInformation" size="20" class="mr-2" />
              <span class="text-sm font-semibold">Aviso de Privacidade</span>
            </div>
            <p class="text-xs text-gray-500 italic leading-snug">
              Seu endereço completo não será exibido publicamente. Ele é utilizado exclusivamente para que possíveis clientes encontrem costureiras mais próximas através da localização aproximada.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="CEP">
              <FormControl
                v-model="profileForm.cep"
                :icon="mdiMapMarker"
                name="cep"
                maxlength="8"
                placeholder="00000000"
                @input="fetchEndereco"
              />
            </FormField>
            <FormField label="Número">
              <FormControl
                v-model="profileForm.numero"
                :icon="mdiHome"
                name="numero"
                placeholder="123"
              />
            </FormField>
          </div>

          <FormField label="Logradouro" help="Rua, Avenida, etc.">
            <FormControl
              v-model="profileForm.logradouro"
              name="logradouro"
              placeholder="Ex: Rua das Flores"
            />
          </FormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Bairro">
              <FormControl
                v-model="profileForm.bairro"
                name="bairro"
              />
            </FormField>
            <FormField label="Cidade">
              <FormControl
                v-model="profileForm.cidade"
                :icon="mdiCity"
                name="cidade"
              />
            </FormField>
          </div>

          <BaseDivider />

          <FormField label="Serviços Prestados" help="Selecione os tipos de serviços que você oferece">
            <FormCheckRadioGroup
              v-model="profileForm.servicosIds"
              name="servicos"
              :options="servicosDisponiveis"
            />
          </FormField>

          <template #footer>
            <BaseButtons>
              <BaseButton color="info" type="submit" label="Salvar Alterações" />
            </BaseButtons>
          </template>
        </CardBox>

        <CardBox v-if="authStore.user?.hasPassword" is-form @submit.prevent="salvarSenha">
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
