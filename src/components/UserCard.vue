<script setup>
import { computed } from 'vue'
import { useMainStore } from '@/stores/main'
import BaseLevel from '@/components/BaseLevel.vue'
import UserAvatarCurrentUser from '@/components/UserAvatarCurrentUser.vue'
import CardBox from '@/components/CardBox.vue'

const mainStore = useMainStore()

const userName = computed(() => mainStore.userName)
</script>

<template>
  <CardBox>
    <BaseLevel type="justify-around lg:justify-center">
      <UserAvatarCurrentUser class="lg:mx-12" />
      <div class="space-y-3 text-center md:text-left lg:mx-12">
        <h1 class="text-2xl">
          Olá, <b>{{ userName }}</b
          >!
        </h1>
      </div>
    </BaseLevel>
  </CardBox>
</template>
