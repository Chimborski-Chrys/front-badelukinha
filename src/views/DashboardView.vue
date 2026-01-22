<script setup>
import { ref, onMounted, computed } from 'vue'
import { mdiEye, mdiWhatsapp, mdiChartTimelineVariant, mdiTrophy, mdiTrendingUp } from '@mdi/js'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxWidget from '@/components/CardBoxWidget.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BarChart from '@/components/Charts/BarChart.vue'
import PieChart from '@/components/Charts/PieChart.vue'
import api from '@/services/api.js'

const loading = ref(true)
const produtos = ref([])

// --- Dados Computados ---

const totalVisualizacoes = computed(() => {
  return produtos.value.reduce((acc, p) => acc + p.cliques, 0)
})

const totalContatos = computed(() => {
  return produtos.value.reduce((acc, p) => acc + p.cliquesWhatsapp, 0)
})

const taxaConversao = computed(() => {
  if (totalVisualizacoes.value === 0) return '0%'
  return ((totalContatos.value / totalVisualizacoes.value) * 100).toFixed(1) + '%'
})

const topProdutos = computed(() => {
  // Ordena por cliques no WhatsApp (maior para menor) e pega os top 3
  return [...produtos.value].sort((a, b) => b.cliquesWhatsapp - a.cliquesWhatsapp).slice(0, 3)
})

// --- Dados para Gráficos ---

const barChartData = computed(() => {
  // Top 5 produtos por visualização para o gráfico
  const top5 = [...produtos.value].sort((a, b) => b.cliques - a.cliques).slice(0, 5)

  return {
    labels: top5.map((p) => (p.nome.length > 15 ? p.nome.substring(0, 15) + '...' : p.nome)),
    datasets: [
      {
        label: 'Visualizações',
        backgroundColor: '#3B82F6', // blue-500
        data: top5.map((p) => p.cliques),
      },
      {
        label: 'Contatos WhatsApp',
        backgroundColor: '#10B981', // green-500
        data: top5.map((p) => p.cliquesWhatsapp),
      },
    ],
  }
})

const pieChartData = computed(() => {
  const visualizouSemContato = totalVisualizacoes.value - totalContatos.value
  return {
    labels: ['Apenas Olharam', 'Entraram em Contato'],
    datasets: [
      {
        backgroundColor: ['#E5E7EB', '#10B981'], // gray-200, green-500
        data: [visualizouSemContato < 0 ? 0 : visualizouSemContato, totalContatos.value],
      },
    ],
  }
})

// --- Fetch Data ---

onMounted(async () => {
  try {
    const response = await api.get('/produtos/meus')
    produtos.value = response.data
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiChartTimelineVariant"
        title="Painel de Performance"
        main
      />

      <!-- KPIs: Cards de Resumo -->
      <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CardBoxWidget
          trend="Total acumulado"
          trend-type="info"
          color="text-blue-500"
          :icon="mdiEye"
          :number="totalVisualizacoes"
          label="Visualizações de Detalhes"
        />
        <CardBoxWidget
          trend="Total acumulado"
          trend-type="success"
          color="text-green-500"
          :icon="mdiWhatsapp"
          :number="totalContatos"
          label="Solicitações de Orçamento"
        />
        <CardBoxWidget
          trend="Eficiência"
          trend-type="alert"
          color="text-red-500"
          :icon="mdiTrendingUp"
          :number="0"
          :prefix="taxaConversao.replace('%', '')"
          suffix="%"
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
            v-else-if="produtos.length === 0"
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
            <p>Seus produtos ainda não receberam contatos.</p>
            <p class="text-sm">Compartilhe sua vitrine para começar!</p>
          </div>
          <div v-else class="flex h-full flex-col justify-around space-y-6 py-4">
            <div
              v-for="(produto, index) in topProdutos"
              :key="produto.id"
              class="flex items-center gap-4"
            >
              <!-- Posição -->
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

              <!-- Imagem -->
              <div
                class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm"
              >
                <img :src="produto.imagemUrl" class="h-full w-full object-cover" alt="Produto" />
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-grow">
                <h4 class="truncate font-semibold text-gray-800">{{ produto.nome }}</h4>
                <div class="flex items-center gap-1 text-xs text-gray-500">
                  <BaseIcon :path="mdiWhatsapp" size="14" class="text-green-500" />
                  {{ produto.cliquesWhatsapp }} contatos
                </div>
                <!-- Barra de Progresso Relativa -->
                <div class="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    class="h-1.5 rounded-full bg-green-500"
                    :style="{
                      width: (produto.cliquesWhatsapp / topProdutos[0].cliquesWhatsapp) * 100 + '%',
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardBox>
      </div>

      <!-- GrÃ¡fico de Pizza: DistribuiÃ§Ã£o -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CardBox class="h-full lg:col-span-1" title="DistribuiÃ§Ã£o de Interesse">
          <div class="relative flex h-64 items-center justify-center">
            <div
              v-if="loading"
              class="absolute h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"
            ></div>
            <PieChart v-if="!loading && totalVisualizacoes > 0" :data="pieChartData" />
            <div v-else-if="!loading" class="text-gray-500">Sem dados para exibir</div>
          </div>
        </CardBox>

        <!-- Dicas de UX -->
        <CardBox
          class="border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 lg:col-span-2"
          title="Dicas para vender mais"
        >
          <div class="space-y-4 text-gray-700">
            <div class="flex gap-3">
              <div class="h-fit rounded-full bg-blue-100 p-2 font-bold text-blue-600">1</div>
              <p>
                <strong>Fotos de qualidade:</strong> Produtos com fotos claras e bem iluminadas
                recebem até 3x mais cliques em "Ver Detalhes".
              </p>
            </div>
            <div class="flex gap-3">
              <div class="h-fit rounded-full bg-blue-100 p-2 font-bold text-blue-600">2</div>
              <p>
                <strong>Descrições completas:</strong> Se você tem muitos cliques mas poucos
                contatos, tente melhorar a descrição. O cliente pode estar com dúvidas que a
                descrição não respondeu.
              </p>
            </div>
            <div class="flex gap-3">
              <div class="h-fit rounded-full bg-blue-100 p-2 font-bold text-blue-600">3</div>
              <p>
                <strong>Preço atrativo:</strong> Use o campo de "Preço Médio" para dar uma noção de
                valor. Produtos "sem preço" costumam ser ignorados.
              </p>
            </div>
          </div>
        </CardBox>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>
