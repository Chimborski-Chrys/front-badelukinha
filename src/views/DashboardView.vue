<script setup>
import { useMainStore } from '@/stores/main'
import { mdiChartTimelineVariant } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'

const mainStore = useMainStore()
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiChartTimelineVariant" title="Painel" main />

      <CardBox>
        <div class="p-4">
          <p>Bem-vindo ao seu painel!</p>
          <p>Aqui você poderá gerenciar seus produtos, acompanhar suas vendas e muito mais.</p>
        </div>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
