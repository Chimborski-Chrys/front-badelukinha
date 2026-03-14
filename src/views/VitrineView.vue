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
import StarRating from '@/components/StarRating.vue' // Importar componente de estrelas
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

const availableBrands = ref([]) // Lista de marcas disponíveis (agora objetos)
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
    // A API agora retorna MenuMarcaDto (NomeMarca, MediaAvaliacoes, TotalAvaliacoes)
    availableBrands.value = response.data.filter(
      (brand) => brand.nomeMarca.toLowerCase() !== 'badelukinha',
    )
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
      params: { searchTerm: searchTerm.value },
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
        mode: 'cors',
      })
      const cepData = await cepResponse.json()
      if (cepData.erro) throw new Error('CEP não encontrado.')

      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${cepData.localidade}, ${cepData.uf}, Brasil`)}`,
      )
      const geoData = await geoResponse.json()

      if (geoData && geoData.length > 0) {
        const { lat, lon } = geoData[0]
        const response = await api.get('/Costureiras/proximas', {
          params: { lat, lon, raioKm: 50 },
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
        paramsSerializer: { indexes: null }, // Para passar arrays corretamente como ?servicosIds=1&servicosIds=2
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
    const text = encodeURIComponent(
      `Olá, vi seu perfil no Badelukinha e gostaria de saber mais sobre seus serviços!`,
    )
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
      return costureirasPorServico.value.some((c) => c.id === p.usuario?.id)
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
        <div class="mx-auto mb-16 max-w-3xl text-center">
          <h1 class="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            {{ pageTitle }}
          </h1>
          <p class="text-lg leading-relaxed font-light text-slate-600">
            Conectamos você aos melhores profissionais da costura e alfaiataria. Peças sob medida,
            ajustes e criações exclusivas para todos os estilos.
          </p>
        </div>

        <div class="flex flex-col gap-10 md:flex-row">
          <!-- Sidebar: Filtros Refinados -->
          <aside class="w-full space-y-8 md:w-1/4 lg:w-1/5">
            <!-- CEP Filter -->
            <div class="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2
                class="mb-4 flex items-center text-sm font-bold tracking-wider text-slate-500 uppercase"
              >
                <BaseIcon :path="mdiMapMarker" class="mr-2 text-indigo-600" />
                Localização
              </h2>
              <FormControl
                v-model="visitorCep"
                placeholder="Seu CEP"
                maxlength="8"
                class="border-none bg-slate-50"
                @input="fetchNearbyCostureiras"
              />
            </div>

            <!-- Services Filter -->
            <div class="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2
                class="mb-4 flex items-center text-sm font-bold tracking-wider text-slate-500 uppercase"
              >
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
            <div class="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 class="mb-4 text-sm font-bold tracking-wider text-slate-500 uppercase">
                Ateliês
              </h2>
              <div class="custom-scrollbar flex max-h-80 flex-col gap-3 overflow-y-auto pr-2">
                <div
                  v-for="brand in availableBrands"
                  :key="brand.nomeMarca"
                  class="group flex items-center justify-between"
                >
                  <div class="flex min-w-0 items-center">
                    <FormCheckRadio
                      v-model="selectedBrands"
                      :input-value="brand.nomeMarca"
                      :label="brand.nomeMarca"
                      name="brands"
                      type="checkbox"
                      class="truncate text-sm font-semibold"
                    />
                  </div>

                  <div class="ml-2 flex flex-shrink-0 items-center space-x-1 text-slate-400">
                    <span class="text-[11px] font-bold text-slate-700">
                      {{ brand.mediaAvaliacoes.toFixed(1).replace('.', ',') }}
                    </span>

                    <BaseIcon :path="mdiStar" size="12" class="text-amber-400" />

                    <span class="cursor-pointer text-[10px] text-blue-500 hover:underline">
                      ({{ brand.totalAvaliacoes }})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main Content -->
          <main class="flex-1">
            <!-- Search Bar -->
            <div class="mb-10 flex items-center gap-3">
              <div class="group relative flex-grow">
                <FormControl
                  v-model="searchTerm"
                  :icon="mdiMagnify"
                  placeholder="Busque por tipo de peça ou serviço..."
                  class="w-full"
                  @keyup.enter="performSearch"
                />
              </div>
              <BaseButton
                label="Buscar"
                color="contrast"
                class="px-8 shadow-md"
                @click="performSearch"
              />
            </div>

            <!-- Seção de Profissionais em Destaque -->
            <div
              v-if="proximasCostureiras.length > 0 || costureirasPorServico.length > 0"
              class="mb-16"
            >
              <h2 class="mb-8 flex items-center text-xl font-bold text-slate-800">
                <span class="mr-4 h-px w-8 bg-slate-300"></span>
                Profissionais Recomendados
              </h2>
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                <div
                  v-for="item in proximasCostureiras.length > 0
                    ? proximasCostureiras.map((p) => ({ ...p.costureira, distancia: p.distancia }))
                    : costureirasPorServico"
                  :key="item.id"
                  class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div class="mb-6 flex items-start gap-5">
                    <img
                      :src="item.fotoPerfilUrl || 'https://via.placeholder.com/60'"
                      class="h-16 w-16 rounded-2xl object-cover shadow-sm ring-4 ring-slate-50"
                    />
                    <div class="flex-grow">
                      <div class="mb-1 flex items-center justify-between">
                        <h3 class="font-bold text-slate-900">{{ item.nomeMarca || item.nome }}</h3>
                        <span
                          v-if="item.distancia"
                          class="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600"
                        >
                          {{ item.distancia.toFixed(1) }} km
                        </span>
                      </div>
                      <div class="mb-3 flex items-center">
                        <StarRating
                          :model-value="item.mediaAvaliacoes || 0"
                          :read-only="true"
                          :size="12"
                        />
                        <span class="ml-1 text-[10px] text-gray-400"
                          >({{ item.totalAvaliacoes || 0 }})</span
                        >
                      </div>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="s in (item.servicos || []).slice(0, 3)"
                          :key="s"
                          class="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[9px] font-black tracking-tighter text-slate-500 uppercase"
                        >
                          {{ typeof s === 'string' ? s : s.nome }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2 border-t border-slate-50 pt-4">
                    <BaseButton
                      label="Ver Ateliê"
                      :to="`/loja/${item.nomeMarca}`"
                      color="info"
                      small
                      outline
                      class="flex-1"
                    />
                    <BaseButton
                      :icon="mdiWhatsapp"
                      color="success"
                      small
                      class="px-3"
                      @click="contactSeamstress(item)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Catálogo de Peças -->
            <div class="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 class="text-xl font-bold text-slate-800">
                Catálogo de Peças
                <span class="ml-2 text-sm font-normal text-slate-400"
                  >({{ filteredProdutos.length }} itens)</span
                >
              </h2>

              <div class="flex gap-2">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  class="rounded-full px-3 py-1 text-xs font-bold transition-all"
                  :class="
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'bg-white text-slate-500 hover:bg-slate-100'
                  "
                  @click="activeCategory = cat"
                >
                  {{ getCategoryLabel(cat) }}
                </button>
              </div>
            </div>

            <div
              v-if="loading"
              class="flex flex-col items-center justify-center py-20 text-slate-400"
            >
              <div
                class="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
              ></div>
              <p>Carregando catálogo...</p>
            </div>

            <div
              v-else-if="filteredProdutos.length > 0"
              class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div
                v-for="produto in filteredProdutos"
                :key="produto.id"
                class="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-50 bg-white shadow-sm transition-all duration-500 hover:shadow-xl"
                @click="openModal(produto)"
              >
                <!-- Imagem -->
                <div class="relative aspect-[4/5] overflow-hidden">
                  <img
                    :src="produto.imagemUrl || 'https://via.placeholder.com/400'"
                    :alt="produto.nome"
                    class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div
                    class="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5"
                  ></div>
                </div>

                <!-- Info -->
                <div class="flex flex-grow flex-col p-6">
                  <div class="mb-3">
                    <span
                      class="rounded bg-indigo-50 px-2 py-1 text-[10px] font-black tracking-widest text-indigo-600 uppercase"
                    >
                      {{ getCategoryLabel(produto.categoria) }}
                    </span>
                  </div>

                  <h3
                    class="mb-4 text-lg leading-tight font-bold text-slate-900 transition-colors group-hover:text-indigo-700"
                  >
                    {{ produto.nome }}
                  </h3>

                  <div
                    class="mt-auto flex items-center justify-between border-t border-slate-50 pt-6"
                  >
                    <div class="flex items-center gap-2">
                      <img
                        :src="produto.usuario?.fotoPerfilUrl || 'https://via.placeholder.com/30'"
                        class="h-7 w-7 rounded-full object-cover shadow-sm ring-2 ring-white"
                      />
                      <span class="text-xs font-bold text-slate-600">{{
                        produto.usuario?.nomeMarca || 'Ateliê'
                      }}</span>
                    </div>

                    <div
                      class="flex items-center text-slate-300 transition-colors group-hover:text-indigo-600"
                    >
                      <span class="mr-1 text-xs font-bold text-slate-400">Ver detalhes</span>
                      <BaseIcon :path="mdiEye" size="18" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="rounded-3xl border border-slate-100 bg-white py-20 text-center shadow-sm"
            >
              <BaseIcon :path="mdiTag" size="64" class="mx-auto mb-6 text-slate-100" />
              <h3 class="mb-2 text-xl font-bold text-slate-800">Nenhum resultado</h3>
              <p class="text-slate-500">Tente ajustar seus filtros ou busca.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
    <!-- Modal de Produto -->
    <ProductModal v-model="isModalOpen" :produto="selectedProduct" />
  </LayoutGuest>
</template>
