<script setup>
import { computed } from 'vue'
import { mdiStar, mdiStarOutline } from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  size: {
    type: [String, Number],
    default: 24
  }
})

const emit = defineEmits(['update:modelValue'])

const stars = computed(() => {
  return [1, 2, 3, 4, 5].map((star) => ({
    value: star,
    icon: star <= props.modelValue ? mdiStar : mdiStarOutline,
    color: star <= props.modelValue ? 'text-yellow-400' : 'text-gray-300'
  }))
})

const setRating = (val) => {
  if (!props.readOnly) {
    emit('update:modelValue', val)
  }
}
</script>

<template>
  <div class="flex items-center">
    <!-- Se for apenas leitura, renderiza divs simples para evitar paddings de botões -->
    <template v-if="readOnly">
      <div
        v-for="star in stars"
        :key="star.value"
        :class="star.color"
        class="flex items-center justify-center p-0 m-0"
      >
        <BaseIcon :path="star.icon" :size="size" />
      </div>
    </template>
    
    <!-- Se for editável, usa botões -->
    <template v-else>
      <button
        v-for="star in stars"
        :key="star.value"
        type="button"
        :class="[star.color, 'cursor-pointer hover:scale-110 transition-transform p-0 m-0 block']"
        @click="setRating(star.value)"
      >
        <BaseIcon :path="star.icon" :size="size" />
      </button>
    </template>
  </div>
</template>
