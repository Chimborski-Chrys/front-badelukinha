<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import { mdiLogin, mdiViewDashboard } from '@mdi/js'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const handleAuthAreaClick = () => {
  if (isAuthenticated.value) {
    router.push('/admin/dashboard')
  } else {
    router.push('/login')
  }
}

const buttonLabel = computed(() => (isAuthenticated.value ? 'Meu Painel' : 'Área da Costureira'))
const buttonIcon = computed(() => (isAuthenticated.value ? mdiViewDashboard : mdiLogin))
</script>

<template>
  <div class="relative">
    <div class="absolute top-4 right-4 z-10">
      <BaseButton
        :icon="buttonIcon"
        :label="buttonLabel"
        color="info"
        rounded-full
        @click="handleAuthAreaClick"
      />
    </div>
    <slot />
  </div>
</template>
