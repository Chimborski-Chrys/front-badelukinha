<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { mdiLogin, mdiViewDashboard } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import UserAvatarCurrentUser from '@/components/UserAvatarCurrentUser.vue'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const handleAuthAreaClick = () => {
  if (isAuthenticated.value) {
    if (authStore.isSuperAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/dashboard') // Dashboard da Costureira
    }
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
        v-if="!isAuthenticated"
        :icon="buttonIcon"
        :label="buttonLabel"
        color="info"
        rounded-full
        @click="handleAuthAreaClick"
      />
      <button
        v-else
        class="inline-flex cursor-pointer items-center justify-center gap-x-2 whitespace-nowrap rounded-full border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold leading-none text-white shadow-md transition-colors focus:outline-none focus:ring-3 focus:ring-blue-300 hover:bg-blue-700 hover:border-blue-700 dark:bg-blue-500 dark:border-blue-500 dark:focus:ring-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-600"
        @click="handleAuthAreaClick"
      >
        <UserAvatarCurrentUser class="h-6 w-6" />
        <span class="truncate">{{ buttonLabel }}</span>
      </button>
    </div>
    <slot />
  </div>
</template>
