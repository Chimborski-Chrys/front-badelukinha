<script setup>
import { computed } from 'vue'
import { useDarkModeStore } from '@/stores/darkMode.js'
import { gradientBgSlate, gradientBgDark } from '@/colors.js'

const props = defineProps({
  bg: {
    type: String,
    required: true,
    validator: (value) => ['slate', 'dark'].includes(value),
  },
})

const colorClass = computed(() => {
  if (useDarkModeStore().isEnabled) {
    return gradientBgDark
  }

  switch (props.bg) {
    case 'slate':
      return gradientBgSlate
    case 'dark':
      return gradientBgDark
  }

  return gradientBgSlate
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50" :class="colorClass">
    <slot card-class="w-11/12 md:w-7/12 lg:w-5/12 xl:w-4/12 shadow-2xl rounded-3xl overflow-hidden" />
  </div>
</template>
