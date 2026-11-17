<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import { Button, DatePicker, Tabs, TabPane, message } from 'ant-design-vue'
import DashboardTab from './DashboardTab.vue'
import ConfigTab from './ConfigTab.vue'
import { DEFAULT_DATE } from './constants'
import { exportBoard, isMockMode } from './api/oqcBoard'
import type { Category, TabKey } from './types'

const selectedDate = ref(DEFAULT_DATE)
const tab = ref<TabKey>('total')
const dashboardRef = ref<InstanceType<typeof DashboardTab> | null>(null)
const exporting = ref(false)

function onDateChange(v: Dayjs | string | null) {
  if (!v) return
  selectedDate.value = typeof v === 'string' ? v : v.format('YYYY-MM-DD')
}

const category = computed(() => tab.value as Category)
const showDashboard = computed(() => tab.value !== 'config')

async function onExport() {
  if (tab.value === 'config') {
    message.warning('请在看板页签导出')
    return
  }
  exporting.value = true
  try {
    const summary = dashboardRef.value?.getSummary?.() || undefined
    const drill = dashboardRef.value?.getDrill?.()
    const ngItems = dashboardRef.value?.getNgItems?.() || []
    const blob = await exportBoard({
      date: selectedDate.value,
      category: category.value,
      grain: drill?.period?.grain,
      periodKey: drill?.period?.key,
      summary: summary || undefined,
      ng: { items: ngItems },
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oqc-appearance-reject-${selectedDate.value}-${category.value}.csv`
    a.click()
    URL.revokeObjectURL(url)
    message.success('导出已开始下载')
  } catch (e) {
    message.error(e instanceof Error ? e.message : '导出失败')
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="board">
    <header class="top">
      <div class="brand">
        <p class="eyebrow">F1 · OQC</p>
        <h1 class="xs-title">OQC 外观抽检批退日报</h1>
      </div>
      <div class="actions">
        <label class="date-label">
          <span>对账日</span>
          <DatePicker
            :value="dayjs(selectedDate)"
            :allow-clear="false"
            format="YYYY-MM-DD"
            aria-label="对账日期"
            @update:value="onDateChange"
          />
        </label>
        <Button
          type="primary"
          :loading="exporting"
          :disabled="tab === 'config'"
          data-xs-button-native
          @click="onExport"
        >
          导出
        </Button>
      </div>
    </header>

    <p v-if="isMockMode()" class="mock-note" role="status">
      当前为 Mock 数据模式（VITE_USE_MOCK≠false）。指标口径以 welcome-oqc-backend 真实接口为准。
    </p>

    <Tabs v-model:activeKey="tab" class="oqc-tabs" destroy-inactive-tab-pane>
      <TabPane key="total" tab="总计" />
      <TabPane key="bga" tab="BGA" />
      <TabPane key="uhd" tab="UHD" />
      <TabPane key="config" tab="配置" />
    </Tabs>

    <DashboardTab
      v-if="showDashboard"
      ref="dashboardRef"
      :date="selectedDate"
      :category="category"
    />
    <ConfigTab v-else />
  </div>
</template>

<style scoped>
.board {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}
.top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.eyebrow {
  margin: 0 0 4px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--xs-secondary);
  font-weight: 600;
}
h1 {
  margin: 0;
  font-size: clamp(22px, 2.4vw, 28px);
}
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.date-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--xs-secondary);
}
.mock-note {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--xs-secondary);
}
</style>
