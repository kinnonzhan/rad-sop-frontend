import { SUMMARY_METRIC_ROWS, type SummaryMetricKey } from '../constants'
import type { SummaryResponse } from '../types'

export function summaryRowsInOrder(): readonly { key: SummaryMetricKey; label: string }[] {
  return SUMMARY_METRIC_ROWS
}

export function assertExportRowOrder(labels: string[]): boolean {
  const expected = SUMMARY_METRIC_ROWS.map((r) => r.label)
  return labels.length === expected.length && labels.every((l, i) => l === expected[i])
}

export function flattenSummaryBlocks(summary: SummaryResponse) {
  return (['month', 'week', 'day'] as const).map((grain) => ({
    grain,
    columns: summary.windows[grain].map((p) => p.label),
    rows: SUMMARY_METRIC_ROWS.map((row) => ({
      label: row.label,
      values: summary.windows[grain].map((p) => p.metrics[row.key]),
    })),
  }))
}
