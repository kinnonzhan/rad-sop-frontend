<script setup lang="ts">
import { computed } from 'vue'
import { flattenSummaryBlocks } from '../utils/exportSummary'
import type { SummaryResponse } from '../types'

const props = defineProps<{ summary: SummaryResponse | null; loading?: boolean }>()

const blocks = computed(() => (props.summary ? flattenSummaryBlocks(props.summary) : []))
const titles: Record<string, string> = { month: '月度汇总', week: '周度汇总', day: '天汇总' }
</script>

<template>
  <section class="xs-card summary" aria-label="七项指标汇总表">
    <h2 class="xs-section-title">汇总</h2>
    <div v-if="loading" class="xs-empty">加载中…</div>
    <div v-else-if="!summary" class="xs-empty">暂无汇总数据</div>
    <div v-else class="blocks">
      <div v-for="block in blocks" :key="block.grain" class="block">
        <h3>{{ titles[block.grain] }}</h3>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">指标</th>
                <th v-for="col in block.columns" :key="col" scope="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in block.rows" :key="row.label">
                <th scope="row">{{ row.label }}</th>
                <td v-for="(v, i) in row.values" :key="i">{{ v }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.summary {
  padding: 16px 20px 20px;
}
.blocks {
  display: grid;
  gap: 16px;
}
.block h3 {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--xs-secondary);
  font-weight: 600;
}
.table-scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th,
td {
  border-bottom: 1px solid var(--xs-separator);
  padding: 8px 10px;
  text-align: right;
  white-space: nowrap;
}
th:first-child,
td:first-child,
tbody th {
  text-align: left;
  font-weight: 600;
}
thead th {
  color: var(--xs-secondary);
  font-weight: 600;
}
</style>
