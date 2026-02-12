<script setup>
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiEye } from '@mdi/js'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['show-product-details'])

const showDetails = () => {
  emit('show-product-details', props.product)
}
</script>

<template>
  <CardBox
    v-if="props.product"
    class="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300"
  >
    <div class="relative w-full h-48 overflow-hidden rounded-t-lg">
      <img
        :src="product.imagemUrl || 'https://via.placeholder.com/400x300?text=Produto+Sem+Imagem'"
        :alt="product.nome"
        class="absolute inset-0 w-full h-full object-cover"
      />
    </div>
    <div class="p-4 flex-grow flex flex-col justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 truncate">
          {{ product.nome }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {{ product.descricao }}
        </p>
        <p class="text-md font-bold text-gray-900 dark:text-gray-50 mb-4">
          R$ {{ product.preco?.toFixed(2) || '0.00' }}
        </p>
      </div>
      <BaseButton
        color="info"
        label="Ver Detalhes"
        :icon="mdiEye"
        small
        class="w-full mt-4"
        @click="showDetails"
      />
    </div>
  </CardBox>
</template>
