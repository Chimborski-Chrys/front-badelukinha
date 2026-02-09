<script setup>
import { mdiPencil, mdiToggleSwitch, mdiToggleSwitchOff } from '@mdi/js'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import UserAvatar from '@/components/UserAvatar.vue'

defineProps({
  costureiras: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['toggle-status', 'editar-pontos'])

const toggleStatus = (costureiraId) => {
  emit('toggle-status', costureiraId)
}

const editarPontos = (costureira) => {
  emit('editar-pontos', costureira)
}

// Função para formatar o armazenamento de bytes para um formato legível
const formatarStorage = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para formatar a data
const formatarData = (dataIso) => {
    if (!dataIso) return 'Nunca';
    return new Date(dataIso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th />
        <th>Nome</th>
        <th>Email</th>
        <th>Último Login</th>
        <th>Produtos</th>
        <th>Storage</th>
        <th>Pontos</th>
        <th>Status</th>
        <th />
      </tr>
    </thead>
    <tbody>
      <tr v-for="costureira in costureiras" :key="costureira.id">
        <td class="border-b-0 before:hidden lg:w-6">
          <UserAvatar :username="costureira.nome" class="mx-auto h-24 w-24 lg:h-6 lg:w-6" />
        </td>
        <td data-label="Nome">
          {{ costureira.nome }}
        </td>
        <td data-label="Email">
          {{ costureira.email }}
        </td>
        <td data-label="Último Login">
          <small>{{ formatarData(costureira.ultimoLogin) }}</small>
        </td>
        <td data-label="Produtos">
          {{ costureira.totalProdutos }}
        </td>
        <td data-label="Storage">
          {{ formatarStorage(costureira.storageUsado) }}
        </td>
        <td data-label="Pontos">
          {{ costureira.pontos }}
        </td>
        <td data-label="Status">
            <span :class="costureira.ativo ? 'text-green-500' : 'text-red-500'">
                {{ costureira.ativo ? 'Ativo' : 'Inativo' }}
            </span>
        </td>
        <td class="whitespace-nowrap before:hidden lg:w-1">
          <BaseButtons type="justify-start lg:justify-end" no-wrap>
            <BaseButton color="info" :icon="mdiPencil" small title="Editar Pontos" @click="editarPontos(costureira)"/>
            <BaseButton :color="costureira.ativo ? 'danger' : 'success'" :icon="costureira.ativo ? mdiToggleSwitch : mdiToggleSwitchOff" small title="Ativar/Inativar" @click="toggleStatus(costureira.id)"/>
          </BaseButtons>
        </td>
      </tr>
    </tbody>
  </table>
</template>
