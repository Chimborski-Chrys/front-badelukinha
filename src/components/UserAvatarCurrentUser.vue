<script setup>
import { useAuthStore } from '@/stores/auth'
import UserAvatar from '@/components/UserAvatar.vue'

const authStore = useAuthStore()

const props = defineProps({
  canChangePhoto: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
    default: 150,
  },
  height: {
    type: Number,
    default: 150,
  },
})

const emit = defineEmits(['file-selected'])

const handleFileSelected = (file) => {
  emit('file-selected', file)
}
</script>

<template>
  <UserAvatar
    :username="authStore.user?.nome"
    :avatar="authStore.user?.fotoPerfilUrl"
    :can-change-photo="props.canChangePhoto"
    :loading="props.loading"
    :width="props.width"
    :height="props.height"
    @file-selected="handleFileSelected"
  />
</template>
