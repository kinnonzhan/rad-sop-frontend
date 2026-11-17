<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Button, Form, FormItem, Input, InputNumber, Space, message } from 'ant-design-vue'
import { fetchDppmConfig, saveDppmConfig } from './api/oqcBoard'
import type { DppmTargetConfig, DppmTargetItem } from './types'

const loading = ref(false)
const saving = ref(false)
const items = ref<DppmTargetItem[]>([])
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await fetchDppmConfig()
    items.value = res.items
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

async function onSave() {
  saving.value = true
  try {
    const body: DppmTargetConfig = { items: items.value }
    const res = await saveDppmConfig(body)
    items.value = res.items
    message.success('目标 DPPM 已保存')
  } catch (e) {
    message.error(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

function addRow() {
  items.value.push({
    id: `new-${Date.now()}`,
    category: 'all',
    targetDppm: 800,
    effectiveFrom: '',
    remark: '',
  })
}

onMounted(load)
</script>

<template>
  <section class="xs-card config" aria-label="目标 DPPM 配置">
    <h2 class="xs-section-title">目标 DPPM 配置</h2>
    <p class="hint">对接后端配置接口；本地默认 Mock，可通过环境变量切换真实 API。</p>
    <div v-if="loading" class="xs-empty">加载中…</div>
    <div v-else-if="error" class="xs-empty">
      {{ error }}
      <div><Button type="link" @click="load">重试</Button></div>
    </div>
    <template v-else>
      <div v-for="(row, idx) in items" :key="row.id" class="row">
        <Form layout="inline">
          <FormItem label="分类">
            <Input v-model:value="row.category" style="width: 120px" aria-label="分类" />
          </FormItem>
          <FormItem label="目标 DPPM">
            <InputNumber v-model:value="row.targetDppm" :min="0" style="width: 140px" aria-label="目标 DPPM" />
          </FormItem>
          <FormItem label="生效日">
            <Input v-model:value="row.effectiveFrom" placeholder="YYYY-MM-DD" style="width: 140px" aria-label="生效日" />
          </FormItem>
          <FormItem label="备注">
            <Input v-model:value="row.remark" style="width: 180px" aria-label="备注" />
          </FormItem>
          <FormItem>
            <Button danger type="link" @click="items.splice(idx, 1)">删除</Button>
          </FormItem>
        </Form>
      </div>
      <Space>
        <Button @click="addRow">新增</Button>
        <Button type="primary" :loading="saving" @click="onSave">保存</Button>
      </Space>
    </template>
  </section>
</template>

<style scoped>
.config {
  padding: 20px;
}
.hint {
  margin: 0 0 16px;
  color: var(--xs-secondary);
  font-size: 13px;
}
.row {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--xs-separator);
}
</style>
