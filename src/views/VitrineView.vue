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
    const { data } = await api.get('/Costureiras/servicos')
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
      const cepResponse = await fetch(`https://viacep.com.br/ws/${visitorCep.value}/json/`, {
        mode: 'cors'
      })
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
    <div class="min-h-screen bg-slate-50 px-4 py-12">
      <div class="container mx-auto">
        <!-- Header / Hero Section -->
        <div class="mb-16 text-center max-w-3xl mx-auto">
          <h1 class="mb-6 text-4xl font-extrabold text-slate-900 md:text-5xl tracking-tight">
            {{ pageTitle }}
          </h1>
          <p class="text-lg text-slate-600 leading-relaxed font-light">
            Conectamos você aos melhores profissionais da costura e alfaiataria. 
            Peças sob medida, ajustes e criações exclusivas para todos os estilos.
          </p>
        </div>

        <div class="flex flex-col gap-10 md:flex-row">
          <!-- Sidebar: Filtros Refinados -->
          <aside class="w-full md:w-1/4 lg:w-1/5 space-y-8">
            <!-- CEP Filter -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 class="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center">
                <BaseIcon :path="mdiMapMarker" class="mr-2 text-indigo-600" />
                Localização
              </h2>
              <FormControl
                v-model="visitorCep"
                placeholder="Seu CEP"
                maxlength="8"
                class="bg-slate-50 border-none"
                @input="fetchNearbyCostureiras"
              />
            </div>

            <!-- Services Filter -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 class="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center">
                <BaseIcon :path="mdiAccountHeart" class="mr-2 text-indigo-600" />
                Especialidades
              </h2>
              <div class="flex flex-col gap-3">
                <FormCheckRadio
                  v-for="service in availableServices"
                  :key="service.id"
                  v-model="selectedServices"
                  :input-value="service.id"
                  :label="service.nome"
                  name="services"
                  type="checkbox"
                  class="text-sm"
                />
              </div>
            </div>

            <!-- Brand Filter -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 class="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Ateliês</h2>
              <div class="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <FormCheckRadio
                  v-for="brand in availableBrands"
                  :key="brand"
                  v-model="selectedBrands"
                  :input-value="brand"
                  :label="brand"
                  name="brands"
                  type="checkbox"
                  class="text-sm"
                />
              </div>
            </div>
          </aside>

          <!-- Main Content -->
          <main class="flex-1">
            <!-- Search Bar -->
            <div class="mb-10 flex items-center gap-3">
              <div class="relative flex-grow group">
                <FormControl
                  v-model="searchTerm"
                  :icon="mdiMagnify"
                  placeholder="Busque por tipo de peça ou serviço..."
                  class="w-full"
                  @keyup.enter="performSearch"
                />
              </div>
              <BaseButton label="Buscar" color="contrast" class="px-8 shadow-md" @click="performSearch" />
            </div>

            <!-- Seção de Profissionais em Destaque -->
            <div v-if="proximasCostureiras.length > 0 || costureirasPorServico.length > 0" class="mb-16">
              <h2 class="text-xl font-bold text-slate-800 mb-8 flex items-center">
                <span class="w-8 h-px bg-slate-300 mr-4"></span>
                Profissionais Recomendados
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div 
                  v-for="item in (proximasCostureiras.length > 0 ? proximasCostureiras.map(p => ({...p.costureira, distancia: p.distancia})) : costureirasPorServico)" 
                  :key="item.id"
                  class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div class="flex items-start gap-5 mb-6">
                    <img :src="item.fotoPerfilUrl || 'https://via.placeholder.com/60'" class="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50 shadow-sm" />
                    <div class="flex-grow">
                      <h3 class="font-bold text-lg text-slate-900 leading-tight">{{ item.nomeMarca || item.nome }}</h3>
                      <p v-if="item.distancia" class="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-tight">
                        A {{ item.distancia.toFixed(1) }} km de você
                      </p>
                      <p v-else class="text-xs text-slate-500 mt-1">{{ item.bairro }}, {{ item.cidade }}</p>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2 mb-6">
                    <span v-for="s in item.servicos" :key="s" class="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase rounded border border-slate-100">
                      {{ s }}
                    </span>
                  </div>
                  <div class="flex gap-3">
                    <BaseButton label="WhatsApp" :icon="mdiWhatsapp" color="success" small class="flex-grow" @click="contactSeamstress(item)" />
                    <BaseButton :to="{ name: 'loja', params: { marca: item.nomeMarca } }" label="Ver Perfil" :icon="mdiEye" color="info" outline small class="flex-grow" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Filtro de Categorias Rápido -->
            <div class="mb-10 flex flex-wrap gap-3 items-center">
              <span class="text-xs font-bold text-slate-400 uppercase mr-2">Filtrar por:</span>
              <button
                v-for="cat in categories"
                :key="cat"
                class="px-5 py-2 rounded-full text-xs font-bold transition-all duration-200"
                :class="activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'"
                @click="activeCategory = cat"
              >
                {{ getCategoryLabel(cat) }}
              </button>
            </div>

            <!-- Galeria de Peças -->
            <div v-if="loading" class="py-20 text-center text-slate-400">
              <div class="animate-pulse flex flex-col items-center">
                <div class="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
                <p>Buscando inspirações...</p>
              </div>
            </div>
            
            <div v-else-if="filteredProdutos.length > 0" class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div v-for="produto in filteredProdutos" :key="produto.id" class="group">
                <div class="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-50 h-full flex flex-col" @click="openModal(produto)">
                  <div class="relative aspect-[4/5] overflow-hidden">
                    <img :src="produto.imagemUrl || 'https://via.placeholder.com/400'" class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                  </div>
                  
                  <div class="p-6 flex flex-col flex-grow">
                    <div class="flex justify-between items-start mb-3">
                      <span class="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {{ getCategoryLabel(produto.categoria) }}
                      </span>
                    </div>
                    <h3 class="mb-4 text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors">
                      {{ produto.nome }}
                    </h3>
                    
                    <div class="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <router-link 
                        v-if="produto?.usuario?.nomeMarca" 
                        :to="{ name: 'loja', params: { marca: produto.usuario.nomeMarca } }" 
                        class="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center" 
                        @click.stop
                      >
                        <BaseIcon :path="mdiTshirtCrew" size="14" class="mr-1" />
                        {{ produto.usuario.nomeMarca }}
                      </router-link>
                      <BaseIcon :path="mdiEye" size="18" class="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
              <p class="text-slate-500 font-medium">Nenhuma peça ou serviço encontrado nesta seleção.</p>
              <BaseButton label="Ver todos" color="info" outline class="mt-4" @click="activeCategory = 'todos'; searchTerm = ''; selectedBrands = []; selectedServices = []" />
            </div>
          </main>
        </div>
      </div>
    </div>
    <ProductModal v-model="isModalOpen" :produto="selectedProduct" />
  </LayoutGuest>
</template>
