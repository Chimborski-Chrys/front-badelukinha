<script setup>
import { containerMaxW } from '@/config.js'
import BaseLevel from '@/components/BaseLevel.vue'
import JustboilLogo from '@/components/JustboilLogo.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="px-6 py-8 mt-12 border-t border-slate-100" :class="containerMaxW">
    <BaseLevel>
      <div class="text-center md:text-left text-slate-500 text-sm">
        <b>&copy; {{ year }} Ateliê Virtual.</b>
        <span class="ml-2 font-light">Conectando talentos da costura a você.</span>
      </div>
      <div class="md:py-2 text-slate-400 font-black tracking-widest text-xs uppercase">
        Feito à mão
      </div>
    </BaseLevel>
  </footer>
</template>
