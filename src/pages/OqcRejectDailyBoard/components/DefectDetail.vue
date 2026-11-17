<script setup lang="ts">
import type { DefectItem } from '../types'

defineProps<{
  batchNo: string | null
  items: DefectItem[]
  loading?: boolean
}>()
</script>

<template>
  <section class="xs-card pane" aria-label="缺陷详情">
    <h2 class="xs-section-title">
      缺陷详情
      <span v-if="batchNo" class="sub">（{{ batchNo }}）</span>
    </h2>
    <div v-if="!batchNo" class="xs-empty">点击批次号查看缺陷详情</div>
    <div v-else-if="loading" class="xs-empty">加载中…</div>
    <div v-else-if="!items.length" class="xs-empty">该批次无缺陷明细</div>
    <vxe-table v-else :data="items" border="inner" size="small" height="280">
      <vxe-column field="defectCode" title="缺陷代码" width="100" />
      <vxe-column field="defectName" title="缺陷名称" min-width="100" />
      <vxe-column field="qty" title="数量" width="80" />
      <vxe-column field="location" title="位置" width="80" />
      <vxe-column field="remark" title="备注" min-width="120" />
    </vxe-table>
  </section>
</template>

<style scoped>
.pane {
  padding: 16px 16px 12px;
  min-height: 340px;
}
.sub {
  color: var(--xs-secondary);
  font-weight: 500;
  font-size: 13px;
}
</style>
