<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxComponentEmpty from '@/components/CardBoxComponentEmpty.vue'
import BaseButton from '@/components/BaseButton.vue'
import PillTag from '@/components/PillTag.vue' // Adicionar PillTag
import ProductModal from '@/components/ProductModal.vue' // Importar o ProductModal
import api from '@/services/api'
import { mdiInformationVariant, mdiWhatsapp, mdiLayers, mdiTag, mdiStar, mdiTshirtCrew, mdiEye } from '@mdi/js'

const route = useRoute()
const costureira = ref(null)
const isLoading = ref(true)
const notification = ref({
  show: false,
  color: 'danger',
  message: '',
})

// --- Modal State for Products ---
const isProductModalOpen = ref(false)
const selectedProductInModal = ref(null)

const handleShowProductDetails = async (produto) => {
  selectedProductInModal.value = produto
  isProductModalOpen.value = true

  // Lógica de registro de clique (copiada da VitrineView.vue)
  const sessionKey = `viewed_product_${produto.id}`
  if (sessionStorage.getItem(sessionKey)) {
    return // Já contou, não faz nada
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
    const response = await api.get(`/Costureiras/publico/marca/${marca}`) // Usar o novo endpoint por marca
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
  // Capitalize first letter of raw category
  return categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)
}

// Observa mudanças no parâmetro 'marca' da rota e recarrega os dados
watch(
  () => route.params.marca,
  (newMarca) => {
    if (newMarca) {
      fetchCostureiraData(newMarca)
    }
  },
  { immediate: true } // Executa imediatamente na montagem do componente
)
</script>

<template>
  <LayoutGuest>
    <div class="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-yellow-50 px-4 py-16">
      <NotificationBar
        v-if="notification.show"
        :color="notification.color"
        @close="notification.show = false"
      >
        {{ notification.message }}
      </NotificationBar>

      <CardBox v-if="isLoading" class="mb-6">
        <p class="text-center py-4">Carregando dados da loja...</p>
      </CardBox>

      <CardBox v-else-if="!costureira" class="mb-6">
        <CardBoxComponentEmpty />
        <p class="text-center py-4">Loja não encontrada ou não é mais válida.</p>
      </CardBox>

      <div v-else class="container mx-auto">
        <!-- Header da Loja -->
        <div class="mb-12 text-center">
          <img
            v-if="costureira.fotoPerfilUrl"
            :src="costureira.fotoPerfilUrl"
            alt="Foto de Perfil"
            class="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
          />
          <img
            v-else-if="costureira.logoUrl"
            :src="costureira.logoUrl"
            alt="Logo da Marca"
            class="mx-auto mb-4 h-24 w-24 object-contain"
          />
          <div
            v-else
            class="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-xl text-gray-500 dark:bg-slate-700 dark:text-gray-400 mx-auto"
          >
            {{ costureira.nome ? costureira.nome.charAt(0).toUpperCase() : '?' }}
          </div>

          <h1 class="mb-4 text-4xl font-bold text-red-700 md:text-6xl">
            {{ costureira?.nomeMarca || costureira?.nome || 'Loja' }}
          </h1>
          <p class="text-xl text-gray-700">
            {{ costureira.sobre || 'Explore os produtos exclusivos desta loja.' }}
          </p>

          <BaseButton
            v-if="costureira.telefoneWhatsApp"
            :href="`https://wa.me/${costureira.telefoneWhatsApp}`"
            target="_blank"
            label="Conversar no WhatsApp"
            color="success"
            :icon="mdiWhatsapp"
            small
            class="mt-4"
          />
        </div>

        <!-- Produtos da Loja -->
        <div class="container mx-auto">
          <div
            v-if="costureira.produtos && costureira.produtos.length > 0"
            class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            <div v-for="produto in costureira.produtos" :key="produto.id" class="group">
              <CardBox
                class="flex h-full cursor-pointer flex-col overflow-hidden border-2 border-dashed border-red-200 bg-white/95 shadow-lg transition-all duration-500 hover:shadow-2xl"
                @click="handleShowProductDetails(produto)"
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
                    class="mb-2 line-clamp-2 flex-grow text-lg leading-tight font-bold text-gray-800"
                  >
                    {{ produto.nome }}
                  </h3>
                  <BaseButton
                    label="Ver Detalhes"
                    :icon="mdiEye"
                    color="info"
                    outline
                    class="mt-auto w-full rounded-lg border-2 py-2 font-semibold hover:bg-blue-50"
                    @click.stop="handleShowProductDetails(produto)"
                  />
                </div>
              </CardBox>
            </div>
          </div>
          <CardBox v-else>
            <CardBoxComponentEmpty />
            <p class="text-center py-4">Esta loja ainda não possui produtos cadastrados.</p>
          </CardBox>
        </div>
      </div>
    </div>
    <!-- Product Modal -->
    <ProductModal v-model="isProductModalOpen" :produto="selectedProductInModal" />
  </LayoutGuest>
</template>
