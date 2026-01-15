<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import PillTag from '@/components/PillTag.vue'
import ProductModal from '@/components/ProductModal.vue'
import api from '@/services/api.js'
import { mdiLayers, mdiTag, mdiStar, mdiTshirtCrew, mdiEye } from '@mdi/js'

const route = useRoute()

// --- Reactive State ---
const produtos = ref([])
const loading = ref(true)
const error = ref(null)
const activeCategory = ref('todos')
const storeName = ref(null) // Nome da loja/costureira se estiver no modo loja

// --- Modal State ---
const isModalOpen = ref(false)
const selectedProduct = ref(null)

const openModal = async (produto) => {
  selectedProduct.value = produto
  isModalOpen.value = true
  
  // Verifica se jÃ¡ registrou clique neste produto nesta sessÃ£o
  const sessionKey = `viewed_product_${produto.id}`
  if (sessionStorage.getItem(sessionKey)) {
    return // JÃ¡ contou, nÃ£o faz nada
  }

  // Registrar clique silenciosamente
  try {
    await api.post(`/produtos/${produto.id}/clique`)
    // Marca como visualizado na sessÃ£o
    sessionStorage.setItem(sessionKey, 'true')
  } catch (err) {
    // Ignora erro de analytics
    console.warn('Falha ao registrar clique', err)
  }
}
// --- Category Mapping ---
// Based on catalogo.js, but using MDI icons
const categoryMap = {
  todos: { label: 'Todos', icon: mdiLayers },
  'conjunto-fleece': { label: 'Conjuntos Fleece', icon: mdiTshirtCrew },
  fantasia: { label: 'Fantasias', icon: mdiStar },
  vestido: { label: 'Vestidos', icon: mdiTag },
  'conjunto-casual': { label: 'Conjuntos Casuais', icon: mdiTshirtCrew },
}
const categories = ref(Object.keys(categoryMap))

// --- Data Fetching ---
const fetchProdutos = async () => {
  loading.value = true
  error.value = null
  produtos.value = []
  storeName.value = null

  try {
    let response

    // Verifica se Ã© uma rota de loja especÃ­fica
    if (route.name === 'loja' && route.params.id) {
      response = await api.get(`/costureiras/${route.params.id}/produtos`)

      // Tenta obter o nome da marca do primeiro produto para exibir no tÃ­tulo
      if (response.data && response.data.length > 0) {
        const usuario = response.data[0].usuario
        storeName.value = usuario.nomeMarca || usuario.nome
      } else {
        storeName.value = 'Loja da Costureira'
      }
    } else {
      // Rota padrÃ£o da vitrine geral
      response = await api.get('/produtos/vitrine')
    }

    produtos.value = response.data
    console.log('Produtos carregados:', produtos.value)
  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
    error.value = 'NÃ£o foi possÃ­vel carregar os produtos. Tente novamente mais tarde.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchProdutos)

// Recarregar se a rota mudar (ex: navegar de uma loja para a vitrine geral)
watch(() => route.params.id, fetchProdutos)

// --- Computed Properties ---
const filteredProdutos = computed(() => {
  if (activeCategory.value === 'todos') {
    return produtos.value
  }
  return produtos.value.filter((produto) => produto.categoria === activeCategory.value)
})

const pageTitle = computed(() => {
  if (storeName.value) {
    return `Vitrine de ${storeName.value}`
  }
  return 'Nosso Catálogo'
})

const pageSubtitle = computed(() => {
  if (storeName.value) {
    return 'Confira as peças exclusivas desta marca.'
  }
  return 'Explore nossas criações feitas com amor e carinho para os pequenos.'
})

// --- Methods ---
const getWhatsAppUrl = (produto) => {
  const phoneNumber = produto.usuario?.telefoneWhatsApp || '5541996147079' // Fallback number
  const message = `Olá! Tenho interesse no produto: ${produto.nome}. Poderia me passar mais informações?`
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}

const getCategoryLabel = (categoryKey) => {
  if (!categoryKey) return 'Geral'
  if (categoryMap[categoryKey]) {
    return categoryMap[categoryKey].label
  }
  // Capitalize first letter of raw category
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
          <p class="text-xl text-gray-700">
            {{ pageSubtitle }}
          </p>
          <div v-if="storeName" class="mt-4">
            <BaseButton to="/" label="Ver Todas as Lojas" color="info" outline small />
          </div>
        </div>

        <!-- Category Filters -->
        <div class="mb-12 flex flex-wrap justify-center gap-2 md:gap-4">
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
        <div v-if="loading" class="py-10 text-center">
          <p>Carregando produtos...</p>
        </div>
        <div v-else-if="error" class="py-10 text-center text-red-500">
          <p>{{ error }}</p>
        </div>

        <!-- Products Grid -->
        <div
          v-else-if="filteredProdutos.length > 0"
          class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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
                <h3
                  class="mb-4 line-clamp-2 flex-grow text-lg leading-tight font-bold text-gray-800"
                >
                  {{ produto.nome }}
                </h3>

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
          <p>Nenhum produto encontrado nesta categoria.</p>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <ProductModal v-model="isModalOpen" :produto="selectedProduct" />
  </LayoutGuest>
</template>
