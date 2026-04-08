<script setup>
import { containerMaxW } from '@/config.js'
import BaseLevel from '@/components/BaseLevel.vue'
import JustboilLogo from '@/components/JustboilLogo.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-12 border-t border-slate-100 px-6 py-8" :class="containerMaxW">
    <BaseLevel>
      <div class="text-center text-sm text-slate-500 md:text-left">
        <b>&copy; {{ year }} Badelukinha.</b>
        <span class="ml-2 font-light">Feito à mão.</span>
      </div>
      <div
        class="flex flex-col items-end text-[10px] font-black tracking-widest text-slate-400 uppercase md:py-2"
      >
        <span class="mt-1 opacity-70">Desenvolvido por rysdigital</span>
      </div>
    </BaseLevel>
  </footer>
</template>
