import { describe, expect, it } from 'vitest'
import { DEFAULT_DATE, SUMMARY_METRIC_ROWS } from '../pages/OqcRejectDailyBoard/constants'
import { assertExportRowOrder } from '../pages/OqcRejectDailyBoard/utils/exportSummary'

describe('AC-1 default date', () => {
  it('defaults to gate reconciliation date 2026-08-27', () => {
    expect(DEFAULT_DATE).toBe('2026-08-27')
  })
})

describe('AC-6 export row order', () => {
  it('locks seven metric labels in required order', () => {
    const labels = SUMMARY_METRIC_ROWS.map((r) => r.label)
    expect(labels).toEqual([
      '检验批数',
      'OK批',
      'NG批',
      '送检数(u)',
      '批退数(u)',
      '实际',
      'Dppm目标',
    ])
    expect(assertExportRowOrder(labels)).toBe(true)
  })
})
