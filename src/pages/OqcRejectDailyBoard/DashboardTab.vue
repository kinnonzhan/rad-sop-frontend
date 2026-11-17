<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import WindowCharts from './components/WindowCharts.vue'
import SummaryTable from './components/SummaryTable.vue'
import NgBatchList from './components/NgBatchList.vue'
import DefectDetail from './components/DefectDetail.vue'
import { fetchDefects, fetchNgBatches, fetchSummary } from './api/oqcBoard'
import { NO_NG_TOAST } from './constants'
import type { Category, DefectItem, DrillPeriod, NgBatchItem, SummaryResponse, WindowPoint, Grain } from './types'
import { initialDrillState, makePeriod, reduceDrill, type DrillState } from './utils/drilldown'

const props = defineProps<{ date: string; category: Category }>()

const summary = ref<SummaryResponse | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const drill = ref<DrillState>(initialDrillState())
const ngItems = ref<NgBatchItem[]>([])
const ngLoading = ref(false)
const defects = ref<DefectItem[]>([])
const defectLoading = ref(false)
/** Keep last defect snapshot so OK/no-NG does not clear/refresh defect area */
const defectBatchNo = ref<string | null>(null)

async function loadSummary() {
  loading.value = true
  error.value = null
  try {
    summary.value = await fetchSummary(props.date, props.category)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    summary.value = null
  } finally {
    loading.value = false
  }
}

async function loadNg(period: DrillPeriod) {
  ngLoading.value = true
  try {
    const res = await fetchNgBatches(props.date, props.category, period.grain, period.key)
    ngItems.value = res.items
  } catch (e) {
    message.error(e instanceof Error ? e.message : '加载 NG 批失败')
    ngItems.value = []
  } finally {
    ngLoading.value = false
  }
}

async function loadDefects(batchNo: string) {
  defectLoading.value = true
  try {
    const res = await fetchDefects(batchNo, props.date, props.category)
    defects.value = res.items
    defectBatchNo.value = batchNo
  } catch (e) {
    message.error(e instanceof Error ? e.message : '加载缺陷失败')
  } finally {
    defectLoading.value = false
  }
}

function resetDrill() {
  drill.value = reduceDrill(drill.value, { type: 'reset' })
  ngItems.value = []
  defects.value = []
  defectBatchNo.value = null
}

watch(
  () => [props.date, props.category] as const,
  () => {
    resetDrill()
    void loadSummary()
  },
  { immediate: true },
)

function onBarClick(payload: { grain: Grain; point: WindowPoint; series: 'ok' | 'ng' }) {
  const period = makePeriod(payload.grain, payload.point.key, payload.point.label)
  if (payload.series === 'ok' || payload.point.ngBatchCount === 0) {
    reduceDrill(drill.value, { type: 'noNg' })
    message.info(NO_NG_TOAST)
    return
  }
  drill.value = reduceDrill(drill.value, { type: 'selectNg', period })
  defects.value = defects.value
  defectBatchNo.value = defectBatchNo.value
  // clear batch selection for new period; defects stay until new batch click (design: clear batchNo)
  defectBatchNo.value = null
  defects.value = []
  void loadNg(period)
}

function onSelectBatch(batchNo: string) {
  drill.value = reduceDrill(drill.value, { type: 'selectBatch', batchNo })
  void loadDefects(batchNo)
}

function retry() {
  void loadSummary()
}

defineExpose({
  getSummary: () => summary.value,
  getDrill: () => drill.value,
  getNgItems: () => ngItems.value,
})
</script>

<template>
  <div class="dashboard">
    <div v-if="error" class="error-banner" role="alert">
      <span>{{ error }}</span>
      <button type="button" class="retry" @click="retry">重试</button>
    </div>
    <WindowCharts
      :month="summary?.windows.month || []"
      :week="summary?.windows.week || []"
      :day="summary?.windows.day || []"
      :loading="loading"
      @bar-click="onBarClick"
    />
    <SummaryTable :summary="summary" :loading="loading" />
    <div class="drill">
      <NgBatchList
        :items="ngItems"
        :loading="ngLoading"
        :period="drill.period"
        :selected-batch-no="drill.batchNo"
        @select-batch="onSelectBatch"
      />
      <DefectDetail :batch-no="defectBatchNo" :items="defects" :loading="defectLoading" />
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: grid;
  gap: 16px;
}
.drill {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--xs-danger) 10%, white);
  color: var(--xs-danger);
  font-size: 13px;
}
.retry {
  border: 1px solid var(--xs-danger);
  background: white;
  color: var(--xs-danger);
  border-radius: 8px;
  padding: 4px 12px;
  cursor: pointer;
}
@media (max-width: 959px) {
  .drill {
    grid-template-columns: 1fr;
  }
}
</style>
