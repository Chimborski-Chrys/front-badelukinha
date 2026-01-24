<script setup>
import { ref, computed, watch } from 'vue'
import { mdiEye, mdiWhatsapp, mdiChartTimelineVariant, mdiTrophy, mdiTrendingUp, mdiArrowUp, mdiArrowDown, mdiArrowRight } from '@mdi/js'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxWidget from '@/components/CardBoxWidget.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BarChart from '@/components/Charts/BarChart.vue'
import api from '@/services/api.js'

// --- Estado ---
const loading = ref(true)
const estatisticasProdutos = ref([])
const dataInicio = ref('')
const dataFim = ref('')

// --- Lógica de Datas e Busca de Dados ---
const setDefaultDateRange = () => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 6) // Últimos 7 dias

  dataInicio.value = startDate.toISOString().split('T')[0]
  dataFim.value = endDate.toISOString().split('T')[0]
}

const fetchEstatisticas = async () => {
  if (!dataInicio.value || !dataFim.value) return
  loading.value = true
  try {
    const response = await api.get('/dashboard/estatisticas-periodo', {
      params: {
        dataInicio: dataInicio.value,
        dataFim: dataFim.value,
      },
    })
    estatisticasProdutos.value = response.data
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)
  } finally {
    loading.value = false
  }
}

// Define as datas padrão e busca os dados na inicialização
setDefaultDateRange()
fetchEstatisticas()

// Busca os dados novamente quando as datas mudam
watch([dataInicio, dataFim], fetchEstatisticas)

// --- Funções de Cálculo de Variação ---
const calcularVariacao = (atual, anterior) => {
  if (anterior === 0) {
    return atual > 0 ? { percentual: 100, tipo: 'positive' } : { percentual: 0, tipo: 'neutral' }
  }
  const percentual = ((atual - anterior) / anterior) * 100
  const tipo = percentual > 0 ? 'positive' : percentual < 0 ? 'negative' : 'neutral'
  return { percentual: Math.abs(percentual), tipo }
}

// --- Propriedades Computadas (Período Atual) ---
const totalVisualizacoes = computed(() => {
  return estatisticasProdutos.value.reduce((acc, p) => acc + p.periodoAtual.visualizacoes, 0)
})

const totalContatos = computed(() => {
  return estatisticasProdutos.value.reduce((acc, p) => acc + p.periodoAtual.cliquesWhatsapp, 0)
})

const taxaConversao = computed(() => {
  if (totalVisualizacoes.value === 0) return 0
  return (totalContatos.value / totalVisualizacoes.value) * 100
})

// --- Propriedades Computadas (Período Anterior) ---
const totalVisualizacoesAnterior = computed(() => {
  return estatisticasProdutos.value.reduce((acc, p) => acc + p.periodoAnterior.visualizacoes, 0)
})

const totalContatosAnterior = computed(() => {
  return estatisticasProdutos.value.reduce((acc, p) => acc + p.periodoAnterior.cliquesWhatsapp, 0)
})

const taxaConversaoAnterior = computed(() => {
  if (totalVisualizacoesAnterior.value === 0) return 0
  return (totalContatosAnterior.value / totalVisualizacoesAnterior.value) * 100
})


// --- Propriedades Computadas (Variações) ---
const variacaoVisualizacoes = computed(() => {
  return calcularVariacao(totalVisualizacoes.value, totalVisualizacoesAnterior.value)
})

const variacaoContatos = computed(() => {
  return calcularVariacao(totalContatos.value, totalContatosAnterior.value)
})

const variacaoTaxaConversao = computed(() => {
  return calcularVariacao(taxaConversao.value, taxaConversaoAnterior.value)
})


// --- Propriedades Computadas (Gráficos e Listas) ---
const topProdutos = computed(() => {
  return [...estatisticasProdutos.value]
    .sort((a, b) => b.periodoAtual.cliquesWhatsapp - a.periodoAtual.cliquesWhatsapp)
    .slice(0, 3)
})

const barChartData = computed(() => {
  const top5 = [...estatisticasProdutos.value]
    .sort((a, b) => b.periodoAtual.visualizacoes - a.periodoAtual.visualizacoes)
    .slice(0, 5)

  return {
    labels: top5.map((p) => (p.nomeProduto.length > 15 ? p.nomeProduto.substring(0, 15) + '...' : p.nomeProduto)),
    datasets: [
      {
        label: 'Visualizações',
        backgroundColor: '#3B82F6', // blue-500
        data: top5.map((p) => p.periodoAtual.visualizacoes),
      },
      {
        label: 'Contatos WhatsApp',
        backgroundColor: '#10B981', // green-500
        data: top5.map((p) => p.periodoAtual.cliquesWhatsapp),
      },
    ],
  }
})

// O PieChart foi removido pois a comparação entre períodos no gráfico de barras é mais relevante agora.
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiChartTimelineVariant" title="Painel de Performance" main />

      <!-- Filtro de Data -->
      <CardBox class="mb-6">
        <div class="flex flex-col gap-4 p-4 md:flex-row md:items-center">
          <FormField label="De:" class="flex-1">
            <FormControl v-model="dataInicio" type="date" />
          </FormField>
          <FormField label="Até:" class="flex-1">
            <FormControl v-model="dataFim" type="date" />
          </FormField>
          <div class="text-center text-sm text-gray-500 md:ml-4">
            Comparando com o período anterior ({{ new Date(dataFim).getDate() - new Date(dataInicio).getDate() + 1 }} dias).
          </div>
        </div>
      </CardBox>

      <!-- KPIs: Cards de Resumo -->
      <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CardBoxWidget
          :trend="`${variacaoVisualizacoes.percentual.toFixed(1)}%`"
          :trend-type="variacaoVisualizacoes.tipo === 'positive' ? 'success' : variacaoVisualizacoes.tipo === 'negative' ? 'danger' : 'info'"
          :trend-icon="variacaoVisualizacoes.tipo === 'positive' ? mdiArrowUp : variacaoVisualizacoes.tipo === 'negative' ? mdiArrowDown : mdiArrowRight"
          color="text-blue-500"
          :icon="mdiEye"
          :number="totalVisualizacoes"
          label="Visualizações de Detalhes"
        />
        <CardBoxWidget
          :trend="`${variacaoContatos.percentual.toFixed(1)}%`"
          :trend-type="variacaoContatos.tipo === 'positive' ? 'success' : variacaoContatos.tipo === 'negative' ? 'danger' : 'info'"
          :trend-icon="variacaoContatos.tipo === 'positive' ? mdiArrowUp : variacaoContatos.tipo === 'negative' ? mdiArrowDown : mdiArrowRight"
          color="text-green-500"
          :icon="mdiWhatsapp"
          :number="totalContatos"
          label="Solicitações de Orçamento"
        />
        <CardBoxWidget
          :trend="`${variacaoTaxaConversao.percentual.toFixed(1)}%`"
          :trend-type="variacaoTaxaConversao.tipo === 'positive' ? 'success' : variacaoTaxaConversao.tipo === 'negative' ? 'danger' : 'info'"
          :trend-icon="variacaoTaxaConversao.tipo === 'positive' ? mdiArrowUp : variacaoTaxaConversao.tipo === 'negative' ? mdiArrowDown : mdiArrowRight"
          color="text-red-500"
          :icon="mdiTrendingUp"
          :number="taxaConversao"
          number-type="percent"
          label="Taxa de Interesse"
        />
      </div>

      <!-- Gráficos e Top 3 -->
      <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Gráfico de Barras: Comparativo -->
        <CardBox class="flex h-full flex-col" title="Top 5 Produtos: Visualização vs Contato">
          <div v-if="loading" class="flex h-64 items-center justify-center">
            <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
          <div
            v-else-if="estatisticasProdutos.length === 0"
            class="flex h-64 items-center justify-center text-gray-500"
          >
            Nenhum dado disponível ainda.
          </div>
          <div v-else class="h-80">
            <BarChart :data="barChartData" />
          </div>
        </CardBox>

        <!-- Pódio das Estrelas (Top 3) -->
        <CardBox class="flex h-full flex-col" title="As Estrelas da Loja (Top 3 Contatos)">
          <div v-if="loading" class="flex h-64 items-center justify-center">
            <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
          <div
            v-else-if="topProdutos.length === 0 || totalContatos === 0"
            class="flex h-64 flex-col items-center justify-center p-4 text-center text-gray-500"
          >
            <BaseIcon :path="mdiTrophy" size="48" class="mb-2 text-gray-300" />
            <p>Seus produtos ainda não receberam contatos neste período.</p>
          </div>
          <div v-else class="flex h-full flex-col justify-around space-y-6 py-4">
            <div
              v-for="(produto, index) in topProdutos"
              :key="produto.produtoId"
              class="flex items-center gap-4"
            >
              <div
                class="w-8 flex-shrink-0 text-center text-xl font-bold"
                :class="
                  index === 0
                    ? 'text-yellow-500'
                    : index === 1
                      ? 'text-gray-400'
                      : 'text-orange-400'
                "
              >
                #{{ index + 1 }}
              </div>
              <div
                class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm"
              >
                <img :src="produto.imagemUrl" class="h-full w-full object-cover" alt="Produto" />
              </div>
              <div class="min-w-0 flex-grow">
                <h4 class="truncate font-semibold text-gray-800">{{ produto.nomeProduto }}</h4>
                <div class="flex items-center gap-1 text-xs text-gray-500">
                  <BaseIcon :path="mdiWhatsapp" size="14" class="text-green-500" />
                  {{ produto.periodoAtual.cliquesWhatsapp }} contatos
                </div>
                <div class="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    class="h-1.5 rounded-full bg-green-500"
                    :style="{
                      width: (produto.periodoAtual.cliquesWhatsapp / (topProdutos[0].periodoAtual.cliquesWhatsapp || 1)) * 100 + '%',
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardBox>
      </div>

       <!-- Dicas de UX -->
       <CardBox
          class="border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50"
          title="Analisando os Resultados"
        >
          <div class="space-y-4 text-gray-700">
            <div class="flex gap-3">
              <div class="h-fit rounded-full bg-blue-100 p-2 font-bold text-blue-600"><BaseIcon :path="mdiArrowUp" /></div>
              <p>
                <strong>Tendência de alta:</strong> Números verdes indicam que sua performance no período selecionado foi melhor que no período anterior. Ótimo trabalho!
              </p>
            </div>
            <div class="flex gap-3">
              <div class="h-fit rounded-full bg-blue-100 p-2 font-bold text-blue-600"><BaseIcon :path="mdiArrowDown" /></div>
              <p>
                <strong>Tendência de baixa:</strong> Números vermelhos indicam uma queda. Analise o que pode ter mudado. Você divulgou menos? A qualidade da foto de um produto novo não está tão boa?
              </p>
            </div>
             <div class="flex gap-3">
              <div class="h-fit rounded-full bg-blue-100 p-2 font-bold text-blue-600">?</div>
              <p>
                <strong>Muitas visualizações e poucos contatos?</strong> Talvez sua descrição não esteja clara ou o preço médio esteja fora da expectativa. Tente adicionar mais detalhes ou ajustar o valor.
              </p>
            </div>
          </div>
        </CardBox>

    </SectionMain>
  </LayoutAuthenticated>
</template>
