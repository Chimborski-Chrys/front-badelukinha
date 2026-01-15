<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import {
  Chart,
  ArcElement,
  PieController,
  Tooltip,
  Legend
} from 'chart.js'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const root = ref(null)

let chart

Chart.register(ArcElement, PieController, Tooltip, Legend)

onMounted(() => {
  chart = new Chart(root.value, {
    type: 'pie',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
      },
    },
  })
})

const chartData = computed(() => props.data)

watch(chartData, (data) => {
  if (chart) {
    chart.data = data
    chart.update()
  }
})
</script>

<template>
  <canvas ref="root" />
</template>
