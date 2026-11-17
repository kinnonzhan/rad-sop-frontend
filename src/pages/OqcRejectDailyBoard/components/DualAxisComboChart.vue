<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { Grain, WindowPoint } from '../types'
import { SERIES_COLORS } from '../constants'

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer,
])

const props = defineProps<{
  title: string
  grain: Grain
  points: WindowPoint[]
  loading?: boolean
}>()

const emit = defineEmits<{
  barClick: [payload: { grain: Grain; point: WindowPoint; series: 'ok' | 'ng' }]
}>()

const el = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

function buildOption() {
  const labels = props.points.map((p) => p.label)
  const ok = props.points.map((p) => p.okBatchCount)
  const ng = props.points.map((p) => p.ngBatchCount)
  const actual = props.points.map((p) => p.actualDppm)
  const target = props.points.map((p) => p.targetDppm)
  const font = getComputedStyle(document.documentElement).getPropertyValue('--xs-type-font').trim() || 'sans-serif'
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--xs-ink').trim() || '#1d1d1f'
  const secondary = getComputedStyle(document.documentElement).getPropertyValue('--xs-secondary').trim() || '#6e6e73'
  const sep = getComputedStyle(document.documentElement).getPropertyValue('--xs-separator').trim() || 'rgba(60,60,67,.12)'

  return {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: font, color: ink, fontSize: 12 },
    aria: { enabled: true },
    animationDuration: 280,
    animationEasing: 'cubicOut' as const,
    title: {
      text: props.title,
      left: 0,
      top: 0,
      textStyle: { fontSize: 14, fontWeight: 700, color: ink, fontFamily: font },
    },
    legend: {
      top: 0,
      right: 0,
      data: ['OK批', 'NG批', '实际', 'Dppm目标'],
      textStyle: { color: ink, fontFamily: font, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 8,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: { left: 8, right: 12, top: 48, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: labels,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: secondary, fontFamily: font },
    },
    yAxis: [
      {
        type: 'value',
        name: '批次数量',
        nameTextStyle: { color: secondary, fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', color: sep } },
        axisLabel: { color: secondary },
      },
      {
        type: 'value',
        name: 'DPPM',
        nameTextStyle: { color: secondary, fontSize: 11 },
        splitLine: { show: false },
        axisLabel: { color: secondary },
      },
    ],
    series: [
      {
        name: 'OK批',
        type: 'bar',
        stack: 'batch',
        barMaxWidth: 28,
        data: ok,
        itemStyle: { color: SERIES_COLORS.ok },
      },
      {
        name: 'NG批',
        type: 'bar',
        stack: 'batch',
        barMaxWidth: 28,
        data: ng,
        itemStyle: { color: SERIES_COLORS.ng },
      },
      {
        name: '实际',
        type: 'line',
        yAxisIndex: 1,
        data: actual,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: SERIES_COLORS.actual, width: 2, type: 'solid' },
        itemStyle: { color: SERIES_COLORS.actual },
      },
      {
        name: 'Dppm目标',
        type: 'line',
        yAxisIndex: 1,
        data: target,
        symbol: 'diamond',
        symbolSize: 7,
        lineStyle: { color: SERIES_COLORS.target, width: 2, type: 'dashed' },
        itemStyle: { color: SERIES_COLORS.target },
      },
    ],
  }
}

function render() {
  if (!el.value) return
  if (!chart) chart = echarts.init(el.value)
  chart.setOption(buildOption(), true)
  chart.off('click')
  chart.on('click', (params) => {
    if (params.componentType !== 'series') return
    if (params.seriesName !== 'OK批' && params.seriesName !== 'NG批') return
    const idx = params.dataIndex
    const point = props.points[idx]
    if (!point) return
    emit('barClick', {
      grain: props.grain,
      point,
      series: params.seriesName === 'NG批' ? 'ng' : 'ok',
    })
  })
}

function onResize() {
  chart?.resize()
}

onMounted(() => {
  render()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})

watch(
  () => [props.points, props.title, props.grain],
  () => render(),
  { deep: true },
)
</script>

<template>
  <div class="chart-wrap" role="img" :aria-label="`${title}：左轴批次数量（OK批蓝柱、NG批红柱堆积），右轴 DPPM（实际黄实线、目标红虚线）`">
    <div ref="el" class="chart" />
    <div v-if="loading" class="chart-mask">加载中…</div>
  </div>
</template>

<style scoped>
.chart-wrap {
  position: relative;
  min-height: 260px;
  width: 100%;
}
.chart {
  width: 100%;
  height: 260px;
}
.chart-mask {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(245, 245, 247, 0.55);
  color: var(--xs-secondary);
  font-size: 13px;
  border-radius: 12px;
}
</style>
