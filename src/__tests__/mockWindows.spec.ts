import { describe, expect, it } from 'vitest'
import { buildMockSummary } from '../pages/OqcRejectDailyBoard/api/mock'
import { DEFAULT_DATE } from '../pages/OqcRejectDailyBoard/constants'

describe('mock window lengths', () => {
  it('returns 3 months, 5 weeks, 7 days for default date', () => {
    const s = buildMockSummary(DEFAULT_DATE, 'total')
    expect(s.windows.month).toHaveLength(3)
    expect(s.windows.week).toHaveLength(5)
    expect(s.windows.day).toHaveLength(7)
    expect(s.windows.day.at(-1)?.key).toBe(DEFAULT_DATE)
  })
})
