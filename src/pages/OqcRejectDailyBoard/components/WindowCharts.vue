<script setup lang="ts">
import DualAxisComboChart from './DualAxisComboChart.vue'
import type { Grain, WindowPoint } from '../types'

defineProps<{
  month: WindowPoint[]
  week: WindowPoint[]
  day: WindowPoint[]
  loading?: boolean
}>()

const emit = defineEmits<{
  barClick: [payload: { grain: Grain; point: WindowPoint; series: 'ok' | 'ng' }]
}>()
</script>

<template>
  <div class="windows">
    <section class="xs-card pane">
      <DualAxisComboChart title="月度" grain="month" :points="month" :loading="loading" @bar-click="emit('barClick', $event)" />
    </section>
    <section class="xs-card pane">
      <DualAxisComboChart title="周度" grain="week" :points="week" :loading="loading" @bar-click="emit('barClick', $event)" />
    </section>
    <section class="xs-card pane">
      <DualAxisComboChart title="天" grain="day" :points="day" :loading="loading" @bar-click="emit('barClick', $event)" />
    </section>
  </div>
</template>

<style scoped>
.windows {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.pane {
  padding: 16px 16px 8px;
}
@media (max-width: 1279px) {
  .windows {
    grid-template-columns: 1fr;
  }
}
</style>
