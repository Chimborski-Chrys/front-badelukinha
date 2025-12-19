<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import { mdiLogin } from '@mdi/js'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="relative">
    <div class="absolute top-4 right-4 z-10">
      <BaseButton
        :icon="mdiLogin"
        label="Área da Costureira"
        color="info"
        rounded-full
        @click="goToLogin"
      />
    </div>
    <slot />
  </div>
</template>