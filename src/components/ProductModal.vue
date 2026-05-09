<script setup>
import { computed } from 'vue'
import { mdiWhatsapp, mdiClose, mdiTag } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import OverlayLayer from '@/components/OverlayLayer.vue'
import PillTag from '@/components/PillTag.vue'
import api from '@/services/api.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  produto: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'contact'])

const close = () => {
  emit('update:modelValue', false)
}

const formattedPrice = computed(() => {
  if (!props.produto || props.produto.precoMedio === undefined) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    props.produto.precoMedio,
  )
})

const whatsappUrl = computed(() => {
  if (!props.produto) return '#'
  const phoneNumber = props.produto.usuario?.telefoneWhatsApp || '5541996147079'
  const message = `Olá! Vi o produto "${props.produto.nome}" no Badelukinha e gostaria de solicitar um orçamento.`
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
})

const registerWhatsappClick = async () => {
  if (!props.produto) return

  // Verifica se já registrou clique no WhatsApp deste produto nesta sessão
  const sessionKey = `whatsapp_click_${props.produto.id}`

  if (!sessionStorage.getItem(sessionKey)) {
    try {
      await api.post(`/produtos/${props.produto.id}/clique-whatsapp`)
      sessionStorage.setItem(sessionKey, 'true')
    } catch (err) {
      console.warn('Falha ao registrar clique no WhatsApp', err)
    }
  }

  emit('contact')
}

// Category Mapping (Consistent with HomeView)
const categoryMap = {
  todos: { label: 'Todos' },
  'conjunto-fleece': { label: 'Conjuntos Fleece' },
  fantasia: { label: 'Fantasias' },
  vestido: { label: 'Vestidos' },
  'conjunto-casual': { label: 'Conjuntos Casuais' },
}

const getCategoryLabel = (categoryKey) => {
  if (!categoryKey) return 'Geral'
  if (categoryMap[categoryKey]) {
    return categoryMap[categoryKey].label
  }
  return categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)
}

// Fecha com ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
})
</script>

<template>
  <OverlayLayer
    v-if="modelValue && produto"
    @overlay-click="close"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm"
  >
    <!-- Modal Container -->
    <div
      class="animate-fade-in-up relative flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl md:h-auto md:max-h-[90vh] md:flex-row"
      @click.stop
    >
      <!-- Close Button -->
      <button
        @click="close"
        class="absolute top-2 right-2 z-50 rounded-full bg-black/20 p-2 text-white shadow-sm backdrop-blur-md transition-colors hover:bg-black/40"
        title="Fechar"
      >
        <svg style="width: 20px; height: 20px" viewBox="0 0 24 24">
          <path fill="currentColor" :d="mdiClose" />
        </svg>
      </button>

      <!-- Image Column -->
      <div
        class="relative flex min-h-[250px] w-full shrink-0 items-center justify-center bg-gray-100 sm:min-h-[300px] md:h-auto md:w-5/12"
      >
        <img
          :src="produto?.imagemUrl || 'https://via.placeholder.com/600'"
          :alt="produto?.nome"
          class="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <!-- Content Column -->
      <div class="relative z-10 flex min-h-0 w-full flex-col bg-white md:w-7/12">
        <!-- Scrollable Content Area -->
        <div class="custom-scrollbar overflow-y-auto p-5 md:p-8">
          <div class="mb-3">
            <h2 class="text-xl leading-tight font-bold text-gray-800 md:text-3xl">
              {{ produto?.nome }}
            </h2>
          </div>

          <div class="prose prose-sm mb-4 leading-relaxed text-gray-600">
            <h3 class="mb-1 text-[10px] font-bold tracking-wide text-gray-400 uppercase">Descrição</h3>
            <p class="whitespace-pre-line text-sm">{{ produto?.descricao }}</p>
          </div>

          <div v-if="produto?.tamanhos?.length > 0" class="mb-2">
            <h3 class="mb-1 text-[10px] font-bold tracking-wide text-gray-400 uppercase">Tamanhos</h3>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tamanho in produto.tamanhos"
                :key="tamanho"
                class="rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700"
              >
                {{ tamanho }}
              </span>
            </div>
          </div>
        </div>

        <!-- Fixed Footer Area -->
        <div class="mt-auto border-t border-gray-100 bg-gray-50 p-4 md:p-6">
          <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div v-if="produto?.precoMedio > 0" class="flex w-full items-baseline justify-center gap-2 sm:w-auto sm:flex-col sm:items-start sm:gap-0">
              <p class="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                A partir de
              </p>
              <span class="text-xl font-black text-slate-900 md:text-2xl">{{ formattedPrice }}</span>
            </div>

            <BaseButton
              :href="whatsappUrl"
              target="_blank"
              :icon="mdiWhatsapp"
              label="Solicitar Orçamento"
              color="success"
              class="w-full rounded-lg py-2.5 font-bold shadow-md sm:w-auto sm:flex-1 sm:px-6"
              @click="registerWhatsappClick"
            />
          </div>
        </div>
      </div>
    </div>
  </OverlayLayer>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>