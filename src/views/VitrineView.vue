<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import PillTag from '@/components/PillTag.vue'
import ProductModal from '@/components/ProductModal.vue'
import FormControl from '@/components/FormControl.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import api from '@/services/api.js'
import {
  mdiLayers,
  mdiTag,
  mdiStar,
  mdiTshirtCrew,
  mdiEye,
  mdiMagnify,
  mdiMapMarker,
  mdiWhatsapp,
  mdiAccountHeart,
} from '@mdi/js'

// --- Reactive State ---
const produtos = ref([])
const loading = ref(true)
const error = ref(null)
const activeCategory = ref('todos')

const searchTerm = ref('') // Termo de busca para produtos
const visitorCep = ref('') // CEP do visitante
const proximasCostureiras = ref([]) // Lista de costureiras próximas
const isSearchingNearby = ref(false)

const availableBrands = ref([]) // Lista de marcas disponíveis
const selectedBrands = ref([]) // Array para marcas selecionadas

const availableServices = ref([]) // Lista de serviços cadastrados no sistema
const selectedServices = ref([]) // Array para serviços selecionados no filtro
const costureirasPorServico = ref([]) // Costureiras que fazem os serviços selecionados

// --- Modal State ---
const isModalOpen = ref(false)
const selectedProduct = ref(null)

const openModal = async (produto) => {
  selectedProduct.value = produto
  isModalOpen.value = true

  const sessionKey = `viewed_product_${produto.id}`
  if (sessionStorage.getItem(sessionKey)) return

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
    availableBrands.value = response.data.filter(brand => brand.toLowerCase() !== 'atelievirtual')
  } catch (err) {
    console.error('Erro ao buscar marcas:', err)
  }
}

const fetchAvailableServices = async () => {
  try {
    const { data } = await api.get('/perfil/servicos-disponiveis')
    availableServices.value = data
  } catch (err) {
    console.error('Erro ao buscar serviços:', err)
  }
}

const fetchProdutos = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/produtos/vitrine', {
      params: { searchTerm: searchTerm.value }
    })
    produtos.value = response.data
  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
    error.value = 'Não foi possível carregar os produtos.'
  } finally {
    loading.value = false
  }
}

const fetchNearbyCostureiras = async () => {
  if (visitorCep.value?.length === 8) {
    isSearchingNearby.value = true
    try {
      const cepResponse = await fetch(`https://viacep.com.br/ws/${visitorCep.value}/json/`)
      const cepData = await cepResponse.json()
      if (cepData.erro) throw new Error('CEP não encontrado.')

      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${cepData.localidade}, ${cepData.uf}, Brasil`)}`)
      const geoData = await geoResponse.json()
      
      if (geoData && geoData.length > 0) {
        const { lat, lon } = geoData[0]
        const response = await api.get('/Costureiras/proximas', {
          params: { lat, lon, raioKm: 50 }
        })
        proximasCostureiras.value = response.data
      }
    } catch (err) {
      console.error('Erro proximidade:', err)
      proximasCostureiras.value = []
    } finally {
      isSearchingNearby.value = false
    }
  } else if (!visitorCep.value) {
    proximasCostureiras.value = []
  }
}

const fetchCostureirasByService = async () => {
  if (selectedServices.value.length > 0) {
    try {
      const { data } = await api.get('/Costureiras', {
        params: { servicosIds: selectedServices.value },
        paramsSerializer: { indexes: null } // Para passar arrays corretamente como ?servicosIds=1&servicosIds=2
      })
      costureirasPorServico.value = data
    } catch (err) {
      console.error('Erro ao buscar costureiras por serviço:', err)
      costureirasPorServico.value = []
    }
  } else {
    costureirasPorServico.value = []
  }
}

watch(selectedServices, fetchCostureirasByService)

const contactSeamstress = (costureira) => {
  const phone = costureira.telefoneWhatsApp?.replace(/\D/g, '')
  if (phone) {
    const text = encodeURIComponent(`Olá, vi seu perfil no AtelieVirtual e gostaria de saber mais sobre seus serviços!`)
    window.open(`https://wa.me/55${phone}?text=${text}`, '_blank')
  } else {
    alert('Esta costureira ainda não cadastrou um telefone de contato.')
  }
}

// --- Search and Filter ---
const performSearch = () => fetchProdutos()

onMounted(() => {
  fetchAvailableBrands()
  fetchAvailableServices()
  fetchProdutos()
})

// --- Computed Properties ---
const filteredProdutos = computed(() => {
  let items = produtos.value
  if (activeCategory.value !== 'todos') {
    items = items.filter((p) => p.categoria === activeCategory.value)
  }
  if (selectedBrands.value.length > 0) {
    items = items.filter((p) => p.usuario && selectedBrands.value.includes(p.usuario.nomeMarca))
  }
  // Filtro de serviços nos produtos
  if (selectedServices.value.length > 0) {
    items = items.filter((p) => {
      // Verifica se a costureira do produto presta algum dos serviços selecionados
      return costureirasPorServico.value.some(c => c.id === p.usuario?.id)
    })
  }
  return items
})

const getCategoryLabel = (key) => categoryMap[key]?.label || key
const pageTitle = computed(() => 'Nosso Catálogo')
const pageSubtitle = computed(() => 'Explore criações únicas, feitas à mão com paixão e arte.')
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

        <div class="flex flex-col gap-8 md:flex-row">
          <!-- Sidebar -->
          <aside class="w-full md:w-1/4 lg:w-1/5">
            <!-- CEP Filter -->
            <CardBox class="p-4 mb-6">
              <h2 class="mb-4 text-lg font-semibold flex items-center">
                <BaseIcon :path="mdiMapMarker" class="mr-2 text-red-600" />
                Proximidade
              </h2>
              <FormControl
                v-model="visitorCep"
                placeholder="Seu CEP"
                maxlength="8"
                @input="fetchNearbyCostureiras"
              />
            </CardBox>

            <!-- Services Filter -->
            <CardBox class="p-4 mb-6">
              <h2 class="mb-4 text-lg font-semibold flex items-center">
                <BaseIcon :path="mdiAccountHeart" class="mr-2 text-blue-600" />
                Serviços
              </h2>
              <div class="flex flex-col gap-2">
                <FormCheckRadio
                  v-for="service in availableServices"
                  :key="service.id"
                  v-model="selectedServices"
                  :input-value="service.id"
                  :label="service.nome"
                  name="services"
                  type="checkbox"
                />
              </div>
            </CardBox>

            <!-- Brand Filter -->
            <CardBox class="p-4">
              <h2 class="mb-4 text-lg font-semibold">Marcas</h2>
              <div class="flex flex-col gap-2 max-h-60 overflow-y-auto">
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

          <!-- Main Content -->
          <main class="flex-1">
            <!-- Search -->
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

            <!-- Seção de Profissionais (Proximidade ou Serviço) -->
            <div v-if="proximasCostureiras.length > 0 || costureirasPorServico.length > 0" class="mb-12">
              <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <BaseIcon :path="mdiAccountHeart" class="mr-2 text-red-600" />
                Costureiras Encontradas
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Se for proximidade, prioriza as próximas -->
                <CardBox 
                  v-for="item in (proximasCostureiras.length > 0 ? proximasCostureiras.map(p => ({...p.costureira, distancia: p.distancia})) : costureirasPorServico)" 
                  :key="item.id"
                  class="border-l-4 border-red-500 shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <div class="flex items-center gap-4 mb-4">
                    <img :src="item.fotoPerfilUrl || 'https://via.placeholder.com/50'" class="w-12 h-12 rounded-full object-cover border-2 border-red-100" />
                    <div>
                      <h3 class="font-bold text-gray-800">{{ item.nomeMarca || item.nome }}</h3>
                      <p v-if="item.distancia" class="text-xs font-semibold text-red-600">{{ item.distancia.toFixed(1) }} km de distância</p>
                      <p v-else class="text-xs text-gray-500">{{ item.bairro }}, {{ item.cidade }}</p>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-1 mb-3">
                    <PillTag v-for="s in item.servicos" :key="s" :label="s" color="info" outline small />
                  </div>
                  <div class="flex gap-2">
                    <BaseButton label="Contactar" :icon="mdiWhatsapp" color="success" small @click="contactSeamstress(item)" />
                    <BaseButton :to="{ name: 'loja', params: { marca: item.nomeMarca } }" label="Ver Loja" :icon="mdiEye" color="info" outline small />
                  </div>
                </CardBox>
              </div>
            </div>

            <!-- Categories -->
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

            <!-- Products -->
            <div v-if="loading" class="py-10 text-center"><p>Carregando...</p></div>
            <div v-else-if="filteredProdutos.length > 0" class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div v-for="produto in filteredProdutos" :key="produto.id" class="group">
                <CardBox class="flex h-full cursor-pointer flex-col overflow-hidden border-2 border-dashed border-red-200 bg-white/95 shadow-lg transition-all duration-500 hover:shadow-2xl" @click="openModal(produto)">
                  <div class="relative overflow-hidden">
                    <img :src="produto.imagemUrl || 'https://via.placeholder.com/300'" class="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div class="flex flex-grow flex-col p-6">
                    <PillTag :label="getCategoryLabel(produto.categoria)" color="danger" outline small class="mb-2 self-start" />
                    <h3 class="mb-2 line-clamp-2 flex-grow text-lg font-bold leading-tight text-gray-800">{{ produto.nome }}</h3>
                    <router-link v-if="produto?.usuario?.nomeMarca" :to="{ name: 'loja', params: { marca: produto.usuario.nomeMarca } }" class="text-sm text-gray-500 hover:text-blue-600 mb-4" @click.stop>
                      Por: {{ produto.usuario.nomeMarca }}
                    </router-link>
                    <BaseButton label="Ver Detalhes" :icon="mdiEye" color="info" outline class="mt-auto w-full" @click.stop="openModal(produto)" />
                  </div>
                </CardBox>
              </div>
            </div>
            <div v-else class="py-10 text-center"><p>Nenhum resultado encontrado.</p></div>
          </main>
        </div>
      </div>
    </div>
    <ProductModal v-model="isModalOpen" :produto="selectedProduct" />
  </LayoutGuest>
</template>
