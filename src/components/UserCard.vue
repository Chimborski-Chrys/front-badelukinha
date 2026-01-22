<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseLevel from '@/components/BaseLevel.vue'
import UserAvatarCurrentUser from '@/components/UserAvatarCurrentUser.vue'
import CardBox from '@/components/CardBox.vue'

const authStore = useAuthStore()

const userName = computed(() => authStore.user?.nome)

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['file-selected'])

const handleFileSelected = (file) => {
  emit('file-selected', file)
}
</script>

<template>
  <CardBox v-if="userName">
    <BaseLevel type="justify-around lg:justify-center">
      <UserAvatarCurrentUser
        class="lg:mx-12"
        :can-change-photo="true"
        :loading="props.loading"
        :width="200"
        :height="200"
        @file-selected="handleFileSelected"
      />
      <div class="space-y-3 text-center md:text-left lg:mx-12">
        <h1 class="text-2xl">
          Olá, <b>{{ userName }}</b
          >!
        </h1>
      </div>
    </BaseLevel>
  </CardBox>
</template>
