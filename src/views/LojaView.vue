<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxComponentEmpty from '@/components/CardBoxComponentEmpty.vue'
import BaseButton from '@/components/BaseButton.vue'
import PillTag from '@/components/PillTag.vue'
import ProductModal from '@/components/ProductModal.vue'
import FormControl from '@/components/FormControl.vue' // Importar FormControl
import ReviewsSection from '@/components/ReviewsSection.vue' // Importar o novo componente de avaliações
import NotificationBar from '@/components/NotificationBar.vue'
import api from '@/services/api'
import { mdiWhatsapp, mdiLayers, mdiTag, mdiStar, mdiTshirtCrew, mdiEye, mdiMagnify, mdiMapMarker, mdiArrowLeft } from '@mdi/js' // Adicionar mdiMagnify, mdiArrowLeft

const route = useRoute()
const costureira = ref(null)
const isLoading = ref(true)
const notification = ref({
  show: false,
  color: 'danger',
  message: '',
})

const searchTermLoja = ref('') // Novo: Termo de busca para produtos da loja
const lojaProdutos = ref([]) // Novo: Lista de produtos da loja

// --- Modal State for Products ---
const isProductModalOpen = ref(false)
const selectedProductInModal = ref(null)

const handleShowProductDetails = async (produto) => {
  selectedProductInModal.value = produto
  isProductModalOpen.value = true

  const sessionKey = `viewed_product_${produto.id}`
  if (sessionStorage.getItem(sessionKey)) {
    return
  }

  try {
    await api.post(`/produtos/${produto.id}/clique`)
    sessionStorage.setItem(sessionKey, 'true')
  } catch (err) {
    console.warn('Falha ao registrar clique', err)
  }
}

const fetchCostureiraData = async (marca) => {
  isLoading.value = true
  notification.value.show = false
  try {
    // Busca apenas o perfil da costureira, sem os produtos aninhados
    const response = await api.get(`/Costureiras/publico/marca/${marca}`)
    costureira.value = response.data
  } catch (error) {
    console.error('Erro ao buscar dados da costureira:', error)
    costureira.value = null
    notification.value = {
      show: true,
      color: 'danger',
      message: error.response?.data?.message || 'Erro ao carregar perfil da loja.',
    }
  } finally {
    isLoading.value = false
  }
}

const fetchLojaProdutos = async () => {
  if (!costureira.value?.id) {
    lojaProdutos.value = []
    return
  }

  try {
    const params = {
      searchTerm: searchTermLoja.value,
    }
    const response = await api.get(`/Costureiras/${costureira.value.id}/produtos`, { params })
    lojaProdutos.value = response.data
  } catch (error) {
    console.error('Erro ao buscar produtos da loja:', error)
    lojaProdutos.value = []
  }
}

// --- Category Mapping ---
const categoryMap = {
  todos: { label: 'Todos', icon: mdiLayers },
  'conjunto-fleece': { label: 'Conjuntos Fleece', icon: mdiTshirtCrew },
  fantasia: { label: 'Fantasias', icon: mdiStar },
  vestido: { label: 'Vestidos', icon: mdiTag },
  'conjunto-casual': { label: 'Conjuntos Casuais', icon: mdiTshirtCrew },
}

// --- Methods ---
const getCategoryLabel = (categoryKey) => {
  if (!categoryKey) return 'Geral'
  if (categoryMap[categoryKey]) {
    return categoryMap[categoryKey].label
  }
  return categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)
}

// Observa mudanças no parâmetro 'marca' da rota e recarrega os dados
watch(
  () => route.params.marca,
  async (newMarca) => {
    if (newMarca) {
      await fetchCostureiraData(newMarca)
      await fetchLojaProdutos() // Carrega os produtos da loja com o searchTermLoja atual (que pode ser vazio)
    }
  },
  { immediate: true },
)

// Observa mudanças no searchTermLoja para recarregar os produtos
watch(searchTermLoja, () => {
  fetchLojaProdutos()
})
</script>

<template>
  <LayoutGuest>
    <div class="min-h-screen bg-slate-50 px-4 py-12">
      <NotificationBar
        v-if="notification.show"
        :color="notification.color"
        @close="notification.show = false"
      >
        {{ notification.message }}
      </NotificationBar>

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-slate-400">
        <div class="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
        <p>Carregando ateliê...</p>
      </div>

      <div v-else-if="!costureira" class="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
        <BaseIcon :path="mdiTshirtCrew" size="64" class="mx-auto mb-6 text-slate-200" />
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Ateliê não encontrado</h2>
        <p class="text-slate-500 mb-8">Este perfil pode ter sido removido ou o link está incorreto.</p>
        <BaseButton to="/" label="Voltar para a vitrine" color="info" outline />
      </div>

      <div v-else class="container mx-auto">
        <!-- Botão Voltar para a Vitrine -->
        <div class="mb-6 flex justify-start">
          <BaseButton
            to="/"
            :icon="mdiArrowLeft"
            label="Voltar para a Vitrine"
            color="white"
            class="text-slate-600 hover:text-indigo-600 transition-colors shadow-sm"
            rounded-full
            small
          />
        </div>

        <!-- Header da Loja: Estilo Editorial -->
        <div class="mb-16 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
          <!-- Decoração sutil de fundo -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div class="flex-shrink-0">
              <img
                v-if="costureira.fotoPerfilUrl"
                :src="costureira.fotoPerfilUrl"
                alt="Foto de Perfil"
                class="h-32 w-32 md:h-40 md:w-40 rounded-2xl object-cover ring-8 ring-slate-50 shadow-md"
              />
              <div
                v-else
                class="flex h-32 w-32 md:h-40 md:w-40 items-center justify-center rounded-2xl bg-slate-100 text-4xl font-bold text-slate-300"
              >
                {{ costureira.nome ? costureira.nome.charAt(0).toUpperCase() : '?' }}
              </div>
            </div>

            <div class="flex-grow text-center md:text-left">
              <div class="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  {{ costureira?.nomeMarca || costureira?.nome || 'Loja' }}
                </h1>
                <div v-if="costureira.servicos && costureira.servicos.length > 0" class="flex flex-wrap justify-center md:justify-start gap-2">
                  <span
                    v-for="servico in costureira.servicos"
                    :key="servico"
                    class="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded tracking-wider"
                  >
                    {{ servico }}
                  </span>
                </div>
              </div>

              <p class="text-lg text-slate-600 mb-8 max-w-2xl leading-relaxed">
                {{ costureira.sobre || 'Nenhum detalhe adicional sobre este ateliê.' }}
              </p>

              <div class="flex flex-wrap justify-center md:justify-start gap-4">
                <BaseButton
                  v-if="costureira.telefoneWhatsApp"
                  :href="`https://wa.me/55${costureira.telefoneWhatsApp.replace(/\D/g, '')}`"
                  target="_blank"
                  label="Contactar Ateliê"
                  color="success"
                  :icon="mdiWhatsapp"
                  class="shadow-lg shadow-emerald-100 px-8"
                />
                <div class="flex items-center text-slate-400 text-sm px-4 border-l border-slate-100">
                  <BaseIcon :path="mdiMapMarker" size="18" class="mr-1" />
                  {{ costureira.bairro || 'Localização não informada' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Produtos da Loja -->
        <div class="space-y-10">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-8">
            <h2 class="text-2xl font-bold text-slate-800">Criações e Amostras</h2>
            
            <div class="flex items-center gap-3 w-full md:w-auto">
              <FormControl
                v-model="searchTermLoja"
                :icon="mdiMagnify"
                placeholder="Buscar no ateliê..."
                class="w-full md:w-64"
                @keyup.enter="fetchLojaProdutos"
              />
              <BaseButton label="Buscar" color="contrast" @click="fetchLojaProdutos" />
            </div>
          </div>

          <div
            v-if="lojaProdutos && lojaProdutos.length > 0"
            class="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            <div v-for="produto in lojaProdutos" :key="produto.id" class="group">
              <div 
                class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-50 cursor-pointer h-full flex flex-col"
                @click="handleShowProductDetails(produto)"
              >
                <div class="relative aspect-[4/5] overflow-hidden">
                  <img
                    :src="produto.imagemUrl || 'https://via.placeholder.com/400'"
                    :alt="produto.nome"
                    class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                  <span class="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded mb-3 self-start">
                    {{ getCategoryLabel(produto.categoria) }}
                  </span>
                  <h3 class="mb-4 text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors">
                    {{ produto.nome }}
                  </h3>
                  <div v-if="produto.tamanhos?.length > 0" class="flex flex-wrap gap-1 mb-4">
                    <span v-for="t in produto.tamanhos" :key="t" class="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded border border-slate-100">
                      {{ t }}
                    </span>
                  </div>
                  <div class="mt-auto flex items-center justify-between text-slate-300 group-hover:text-indigo-600 transition-colors pt-4 border-t border-slate-50">
                    <span class="text-xs font-bold text-slate-400">Ver detalhes</span>
                    <BaseIcon :path="mdiEye" size="18" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <BaseIcon :path="mdiTag" size="48" class="mx-auto mb-4 text-slate-200" />
            <p class="text-slate-500 font-medium">Nenhuma peça encontrada neste ateliê.</p>
          </div>
        </div>

        <!-- Avaliações dos Clientes -->
        <div v-if="costureira" class="mt-20 border-t border-slate-100 pt-16">
          <ReviewsSection :costureira-id="costureira.id" />
        </div>
      </div>
    </div>
    <!-- Product Modal -->
    <ProductModal v-model="isProductModalOpen" :produto="selectedProductInModal" />
  </LayoutGuest>
</template>
