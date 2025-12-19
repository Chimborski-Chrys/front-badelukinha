<script setup>
import { ref, onMounted, computed } from 'vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import PillTag from '@/components/PillTag.vue'
import api from '@/services/api.js'
import { mdiLayers, mdiTag, mdiStar, mdiTshirtCrew } from '@mdi/js'

// --- Reactive State ---
const produtos = ref([])
const loading = ref(true)
const error = ref(null)
const activeCategory = ref('todos')

// --- Category Mapping ---
// Based on catalogo.js, but using MDI icons
const categoryMap = {
  todos: { label: 'Todos', icon: mdiLayers },
  'conjunto-fleece': { label: 'Conjuntos Fleece', icon: mdiTshirtCrew },
  fantasia: { label: 'Fantasias', icon: mdiStar },
  vestido: { label: 'Vestidos', icon: mdiTag },
  'conjunto-casual': { label: 'Conjuntos Casuais', icon: mdiTshirtCrew }
}
const categories = ref(Object.keys(categoryMap))

// --- Data Fetching ---
const fetchProdutos = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/produtos/vitrine')
    produtos.value = response.data
    console.log('Produtos carregados:', produtos.value)
  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
    error.value = 'Não foi possível carregar os produtos. Tente novamente mais tarde.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchProdutos)

// --- Computed Properties ---
const filteredProdutos = computed(() => {
  if (activeCategory.value === 'todos') {
    return produtos.value
  }
  return produtos.value.filter((produto) => produto.categoria === activeCategory.value)
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
    <div class="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-yellow-50 py-16 px-4">
      <div class="container mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-6xl font-bold text-red-700 mb-4">Nosso Catálogo</h1>
          <p class="text-xl text-gray-700">
            Explore nossas criações feitas com amor e carinho para os pequenos.
          </p>
        </div>

        <!-- Category Filters -->
        <div class="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
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
        <div v-if="loading" class="text-center py-10">
          <p>Carregando produtos...</p>
        </div>
        <div v-else-if="error" class="text-center py-10 text-red-500">
          <p>{{ error }}</p>
        </div>

        <!-- Products Grid -->
        <div v-else-if="filteredProdutos.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div
            v-for="produto in filteredProdutos"
            :key="produto.id"
            class="group"
          >
            <CardBox class="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-red-200 border-dashed bg-white/95 h-full flex flex-col">
              <div class="relative overflow-hidden">
                <img
                  :src="produto.imagemUrl || 'https://via.placeholder.com/300'"
                  :alt="produto.nome"
                  class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div class="p-6 flex-grow flex flex-col">
                <PillTag
                  :label="getCategoryLabel(produto.categoria)"
                  color="danger"
                  outline
                  small
                  class="mb-2 self-start"
                />
                <h3 class="text-xl font-bold text-red-700 mb-2 flex-grow">{{ produto.nome }}</h3>
                <p class="text-gray-600 mb-4 text-sm leading-relaxed">{{ produto.descricao }}</p>
                <BaseButton
                  :href="getWhatsAppUrl(produto)"
                  target="_blank"
                  label="Solicitar Orçamento"
                  class="w-full mt-auto bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-lg shadow-lg font-semibold"
                />
              </div>
            </CardBox>
          </div>
        </div>

        <!-- No Products Found -->
        <div v-else class="text-center py-10">
          <p>Nenhum produto encontrado nesta categoria.</p>
        </div>

      </div>
    </div>
  </LayoutGuest>
</template>
