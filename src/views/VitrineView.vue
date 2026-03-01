<script setup>
import { ref, onMounted, computed } from 'vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import PillTag from '@/components/PillTag.vue'
import ProductModal from '@/components/ProductModal.vue'
import FormControl from '@/components/FormControl.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue' // Importar o componente de checkbox
import api from '@/services/api.js'
import {
  mdiLayers,
  mdiTag,
  mdiStar,
  mdiTshirtCrew,
  mdiEye,
  mdiMagnify,
} from '@mdi/js'

// --- Reactive State ---
const produtos = ref([])
const loading = ref(true)
const error = ref(null)
const activeCategory = ref('todos')

const searchTerm = ref('') // Termo de busca para produtos
const availableBrands = ref([]) // Lista de marcas disponíveis
const selectedBrands = ref([]) // Array para marcas selecionadas com checkboxes

// --- Modal State ---
const isModalOpen = ref(false)
const selectedProduct = ref(null)

const openModal = async (produto) => {
  selectedProduct.value = produto
  isModalOpen.value = true

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

// --- Category Mapping ---
const categoryMap = {
  todos: { label: 'Todos', icon: mdiLayers },
  'conjunto-fleece': { label: 'Conjuntos Fleece', icon: mdiTshirtCrew },
  fantasia: { label: 'Fantasias', icon: mdiStar },
  vestido: { label: 'Vestidos', icon: mdiTag },
  'conjunto-casual': { label: 'Conjuntos Casuais', icon: mdiTshirtCrew },
}
const categories = ref(Object.keys(categoryMap))

// --- Data Fetching ---
const fetchAvailableBrands = async () => {
  try {
    const response = await api.get('/Costureiras/marcas')
    // Filtrar 'atelieVirtual' da lista de marcas
    availableBrands.value = response.data.filter(brand => brand.toLowerCase() !== 'atelievirtual')
  } catch (err) {
    console.error('Erro ao buscar marcas disponíveis:', err)
  }
}

const fetchProdutos = async () => {
  loading.value = true
  error.value = null
  produtos.value = []

  try {
    // A busca agora é mais simples, pode ser refinada com searchTerm se necessário no futuro
    const response = await api.get('/produtos/vitrine', {
      params: { searchTerm: searchTerm.value }
    })
    produtos.value = response.data
  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
    error.value = 'Não foi possível carregar os produtos. Tente novamente mais tarde.'
  } finally {
    loading.value = false
  }
}

// --- Search and Filter ---
const performSearch = () => {
  // A busca é feita no backend, então chamamos fetchProdutos
  fetchProdutos()
}

onMounted(() => {
  fetchAvailableBrands()
  fetchProdutos() // Carrega os produtos iniciais
})

// --- Computed Properties ---
const filteredProdutos = computed(() => {
  let items = produtos.value

  // 1. Filtrar por categoria
  if (activeCategory.value !== 'todos') {
    items = items.filter((produto) => produto.categoria === activeCategory.value)
  }

  // 2. Filtrar por marcas selecionadas
  if (selectedBrands.value.length > 0) {
    items = items.filter(
      (produto) =>
        produto.usuario && selectedBrands.value.includes(produto.usuario.nomeMarca),
    )
  }

  // A busca por texto (searchTerm) já é feita no backend, então não precisamos filtrar aqui.
  
  return items
})

const pageTitle = computed(() => 'Nosso Catálogo')
const pageSubtitle = computed(() => 'Explore criações únicas, feitas à mão com paixão e arte.')

// --- Methods ---
const getCategoryLabel = (categoryKey) => {
  if (!categoryKey) return 'Geral'
  if (categoryMap[categoryKey]) {
    return categoryMap[categoryKey].label
  }
  return categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)
}
</script>

<template>
  <LayoutGuest>
    <div class="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-yellow-50 px-4 py-16">
      <div class="container mx-auto">
        <!-- Header -->
        <div class="mb-12 text-center">
          <h1 class="mb-4 text-4xl font-bold text-red-700 md:text-6xl">{{ pageTitle }}</h1>
          <p class="text-xl text-gray-700">{{ pageSubtitle }}</p>
        </div>

        <!-- Main Content Area with Sidebar -->
        <div class="flex flex-col gap-8 md:flex-row">
          <!-- Sidebar: Brand Filter -->
          <aside class="w-full md:w-1/4 lg:w-1/5">
            <CardBox class="p-4">
              <h2 class="mb-4 text-lg font-semibold">Marcas</h2>
              <div class="flex flex-col gap-2">
                <FormCheckRadio
                  v-for="brand in availableBrands"
                  :key="brand"
                  v-model="selectedBrands"
                  :input-value="brand"
                  :label="brand"
                  name="brands"
                  type="checkbox"
                />
              </div>
            </CardBox>
          </aside>

          <!-- Main Content: Search, Categories, Products -->
          <main class="flex-1">
            <!-- Search Section -->
            <div class="mb-8 flex items-center gap-2">
              <FormControl
                v-model="searchTerm"
                :icon="mdiMagnify"
                placeholder="Buscar por produto..."
                class="flex-grow"
                @keyup.enter="performSearch"
              />
              <BaseButton label="Buscar" :icon="mdiMagnify" color="info" @click="performSearch" />
            </div>

            <!-- Category Filters -->
            <div class="mb-8 flex flex-wrap justify-center gap-2">
              <PillTag
                v-for="cat in categories"
                :key="cat"
                :label="categoryMap[cat].label"
                :icon="categoryMap[cat].icon"
                :color="activeCategory === cat ? 'danger' : 'contrast'"
                :outline="activeCategory !== cat"
                class="cursor-pointer transition-all duration-300"
                @click="activeCategory = cat"
              />
            </div>

            <!-- Loading / Error State -->
            <div v-if="loading" class="py-10 text-center"><p>Carregando produtos...</p></div>
            <div v-else-if="error" class="py-10 text-center text-red-500"><p>{{ error }}</p></div>

            <!-- Products Grid -->
            <div
              v-else-if="filteredProdutos.length > 0"
              class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div v-for="produto in filteredProdutos" :key="produto.id" class="group">
                <CardBox
                  class="flex h-full cursor-pointer flex-col overflow-hidden border-2 border-dashed border-red-200 bg-white/95 shadow-lg transition-all duration-500 hover:shadow-2xl"
                  @click="openModal(produto)"
                >
                  <div class="relative overflow-hidden">
                    <img
                      :src="produto.imagemUrl || 'https://via.placeholder.com/300'"
                      :alt="produto.nome"
                      class="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div class="flex flex-grow flex-col p-6">
                    <PillTag
                      :label="getCategoryLabel(produto.categoria)"
                      color="danger"
                      outline
                      small
                      class="mb-2 self-start"
                    />
                    <h3 class="mb-2 line-clamp-2 flex-grow text-lg font-bold leading-tight text-gray-800">
                      {{ produto.nome }}
                    </h3>
                    <router-link
                      v-if="produto?.usuario?.nomeMarca"
                      :to="{ name: 'loja', params: { marca: produto.usuario.nomeMarca } }"
                      class="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      @click.stop
                    >
                      Por: {{ produto.usuario.nomeMarca || produto.usuario.nome }}
                    </router-link>
                    <BaseButton
                      label="Ver Detalhes"
                      :icon="mdiEye"
                      color="info"
                      outline
                      class="mt-auto w-full rounded-lg border-2 py-2 font-semibold hover:bg-blue-50"
                      @click.stop="openModal(produto)"
                    />
                  </div>
                </CardBox>
              </div>
            </div>

            <!-- No Products Found -->
            <div v-else class="py-10 text-center">
              <p>Nenhum produto encontrado com os filtros selecionados.</p>
            </div>
          </main>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <ProductModal v-model="isModalOpen" :produto="selectedProduct" />
  </LayoutGuest>
</template>
