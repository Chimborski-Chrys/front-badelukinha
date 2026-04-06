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
        v-if="!isAuthenticated"
        :icon="buttonIcon"
        :label="buttonLabel"
        color="info"
        rounded-full
        @click="handleAuthAreaClick"
      />
      <button
        v-else
        class="inline-flex cursor-pointer items-center justify-center gap-x-2 whitespace-nowrap rounded-full border border-transparent bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
        @click="handleAuthAreaClick"
      >
        <UserAvatarCurrentUser class="h-6 w-6 rounded-full border border-slate-700" />
        <span class="truncate">{{ buttonLabel }}</span>
      </button>
    </div>
    <slot />
  </div>
</template>
