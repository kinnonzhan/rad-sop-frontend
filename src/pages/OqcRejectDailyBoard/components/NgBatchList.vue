<script setup lang="ts">
import { computed } from 'vue'
import type { DrillPeriod, NgBatchItem } from '../types'

const props = defineProps<{
  items: NgBatchItem[]
  loading?: boolean
  period: DrillPeriod | null
  selectedBatchNo: string | null
}>()

const emit = defineEmits<{ selectBatch: [batchNo: string] }>()

const title = computed(() =>
  props.period ? `NG 批明细（${props.period.label}）` : 'NG 批明细',
)

function rowClassName({ row }: { row: NgBatchItem }) {
  return row.batchNo === props.selectedBatchNo ? 'row-selected' : ''
}
</script>

<template>
  <section class="xs-card pane" aria-label="NG 批明细">
    <h2 class="xs-section-title">{{ title }}</h2>
    <div v-if="!period" class="xs-empty">点击图表中的 NG 红柱查看该周期 NG 批</div>
    <div v-else-if="loading" class="xs-empty">加载中…</div>
    <div v-else-if="!items.length" class="xs-empty">当前周期无 NG 批</div>
    <vxe-table
      v-else
      :data="items"
      border="inner"
      size="small"
      height="280"
      :row-config="{ isHover: true, isCurrent: true }"
      :row-class-name="rowClassName"
    >
      <vxe-column field="batchNo" title="批次号" min-width="140">
        <template #default="{ row }">
          <button type="button" class="batch-link" @click="emit('selectBatch', row.batchNo)">
            {{ row.batchNo }}
          </button>
        </template>
      </vxe-column>
      <vxe-column field="product" title="产品" min-width="100" />
      <vxe-column field="category" title="分类" width="80" />
      <vxe-column field="yieldRate" title="良率%" width="80" />
      <vxe-column field="inspectQty" title="送检数" width="80" />
      <vxe-column field="rejectQty" title="批退数" width="80" />
      <vxe-column field="defectSummary" title="缺陷摘要" min-width="120" />
    </vxe-table>
  </section>
</template>

<style scoped>
.pane {
  padding: 16px 16px 12px;
  min-height: 340px;
}
:deep(.row-selected) {
  background: var(--xs-brand-10) !important;
}
</style>
