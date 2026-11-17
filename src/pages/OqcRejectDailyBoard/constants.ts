export const DEFAULT_DATE = '2026-08-27'

export const TAB_KEYS = ['total', 'bga', 'uhd', 'config'] as const
export type TabKey = (typeof TAB_KEYS)[number]

export const CATEGORY_TABS = [
  { key: 'total', label: '总计' },
  { key: 'bga', label: 'BGA' },
  { key: 'uhd', label: 'UHD' },
] as const

export const SUMMARY_METRIC_ROWS = [
  { key: 'inspectBatchCount', label: '检验批数' },
  { key: 'okBatchCount', label: 'OK批' },
  { key: 'ngBatchCount', label: 'NG批' },
  { key: 'inspectQty', label: '送检数(u)' },
  { key: 'rejectQty', label: '批退数(u)' },
  { key: 'actualDppm', label: '实际' },
  { key: 'targetDppm', label: 'Dppm目标' },
] as const

export type SummaryMetricKey = (typeof SUMMARY_METRIC_ROWS)[number]['key']

/** Business series colors (AC-4); mapped to Apple HIG system roles from design MCP palette. */
export const SERIES_COLORS = {
  ok: '#0088ff',
  ng: '#ff383c',
  actual: '#ffd60a',
  target: '#c93432',
} as const

export const NO_NG_TOAST = '当前周期无 NG 批'
