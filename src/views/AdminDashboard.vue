<script setup>
import { ref, onMounted, watch } from 'vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import TableCostureiras from '@/components/TableCostureiras.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import { mdiAccountMultiple, mdiChartBox } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import api from '@/services/api'

// --- State: Tabela de Costureiras ---
const loading = ref(true)
const costureiras = ref([])

// --- State: Modal de Pontos ---
const isModalPontosActive = ref(false)
const costureiraSelecionada = ref(null)
const novosPontos = ref(0)

// --- State: Estatísticas de Produtos ---
const loadingEstatisticas = ref(false)
const totalProdutos = ref(0)
const dataInicio = ref('')
const dataFim = ref('')
const costureiraFiltroId = ref('') // '' para "Todos"

// --- Métodos ---
const fetchEstatisticas = async () => {
  if (!dataInicio.value || !dataFim.value) return

  // Função simples para converter yyyy-mm-dd -> dd/mm/yyyy
  const toBRFormat = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  loadingEstatisticas.value = true
  try {
    const response = await api.get('/admin/estatisticas/produtos', {
      params: {
        // Agora passamos como string formatada em PT-BR
        dataInicioStr: toBRFormat(dataInicio.value),
        dataFimStr: toBRFormat(dataFim.value),
        usuarioId: costureiraFiltroId.value || null,
      },
    })
    totalProdutos.value = response.data.totalProdutos
  } catch (error) {
    console.error('Erro ao consultar:', error)
  } finally {
    loadingEstatisticas.value = false
  }
}

// --- Hooks e Watchers ---
onMounted(async () => {
  await carregarCostureiras()
  setDefaultDateRange()
  // fetchEstatisticas() will be called manually by the button
})

// --- Métodos ---
const carregarCostureiras = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/costureiras-dashboard')
    costureiras.value = response.data
  } catch (error) {
    console.error('Erro ao carregar dados das costureiras:', error)
  } finally {
    loading.value = false
  }
}

const setDefaultDateRange = () => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 29) // Últimos 30 dias

  dataInicio.value = startDate.toISOString().split('T')[0]
  dataFim.value = endDate.toISOString().split('T')[0]
}

const handleToggleStatus = async (costureiraId) => {
  try {
    await api.put(`/admin/costureiras/${costureiraId}/alternar-status`)
    const costureira = costureiras.value.find((c) => c.id === costureiraId)
    if (costureira) {
      costureira.ativo = !costureira.ativo
    }
  } catch (error) {
    console.error('Erro ao alternar status da costureira:', error)
  }
}

const handleEditarPontos = (costureira) => {
  costureiraSelecionada.value = costureira
  novosPontos.value = costureira.pontos
  isModalPontosActive.value = true
}

const salvarPontos = async () => {
  if (!costureiraSelecionada.value) return

  try {
    await api.put(
      `/admin/costureiras/${costureiraSelecionada.value.id}/pontos`,
      novosPontos.value,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    const costureira = costureiras.value.find((c) => c.id === costureiraSelecionada.value.id)
    if (costureira) {
      costureira.pontos = novosPontos.value
    }
  } catch (error) {
    console.error('Erro ao salvar pontos:', error)
  } finally {
    isModalPontosActive.value = false
    costureiraSelecionada.value = null
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <!-- Modal para Edição de Pontos -->
    <CardBoxModal
      v-model="isModalPontosActive"
      title="Editar Pontos"
      button-label="Salvar"
      @confirm="salvarPontos"
    >
      <div v-if="costureiraSelecionada">
        <p class="mb-4">
          Editando pontos para <strong>{{ costureiraSelecionada.nome }}</strong
          >.
        </p>
        <FormField label="Pontos">
          <FormControl v-model="novosPontos" type="number" />
        </FormField>
      </div>
    </CardBoxModal>

    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiAccountMultiple"
        title="Gerenciamento de Costureiras"
        main
      />

      <CardBox class="mb-6" has-table>
        <div v-if="loading" class="flex h-64 items-center justify-center">
          <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
        <div v-else>
          <TableCostureiras
            :costureiras="costureiras"
            @toggle-status="handleToggleStatus"
            @editar-pontos="handleEditarPontos"
          />
        </div>
      </CardBox>

      <SectionTitleLineWithButton :icon="mdiChartBox" title="Estatísticas de Criação de Produtos" />

      <CardBox class="mb-6">
        <div class="flex flex-col gap-4 p-4 md:flex-row md:items-center">
          <FormField label="De:" class="flex-1">
            <FormControl v-model="dataInicio" type="date" />
          </FormField>
          <FormField label="Até:" class="flex-1">
            <FormControl v-model="dataFim" type="date" />
          </FormField>
          <FormField label="Costureira:" class="flex-1">
            <FormControl
              v-model="costureiraFiltroId"
              :options="[
                { id: '', label: 'Todas' },
                ...costureiras.map((c) => ({ id: c.id, label: c.nome })),
              ]"
            />
          </FormField>
          <BaseButton
            label="Consultar"
            color="info"
            @click="fetchEstatisticas"
            class="mt-6 md:mt-0"
          />
        </div>
        <div class="p-4 text-center">
          <div v-if="loadingEstatisticas" class="flex h-16 items-center justify-center">
            <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
          <div v-else>
            <h3 class="text-3xl font-bold text-gray-800">{{ totalProdutos }}</h3>
            <p class="text-gray-500">Produtos criados no período</p>
          </div>
        </div>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
