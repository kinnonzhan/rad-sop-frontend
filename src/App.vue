<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import OqcRejectDailyBoard from './pages/OqcRejectDailyBoard/index.vue'

const theme = {
  token: {
    colorPrimary: '#00A95F',
    colorInfo: '#00A95F',
    colorSuccess: '#00A95F',
    colorError: '#C93432',
    colorWarning: '#9B620B',
    borderRadius: 8,
    fontFamily:
      "'HarmonyOS Sans SC', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif",
  },
}
</script>

<template>
  <ConfigProvider :locale="zhCN" :theme="theme">
    <OqcRejectDailyBoard />
  </ConfigProvider>
</template>
