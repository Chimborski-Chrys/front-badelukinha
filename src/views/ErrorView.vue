<script setup>
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="pinkRed">
      <CardBox :class="cardClass">
        <div class="space-y-3">
          <h1 class="text-2xl">Ocorreu um Erro</h1>

          <p>Uma exceção não tratada ocorreu.</p>
        </div>

        <template #footer>
          <BaseButtons>
            <BaseButton label="Concluído" to="/" color="danger" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
