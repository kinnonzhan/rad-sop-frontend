import { describe, expect, it } from 'vitest'
import { initialDrillState, makePeriod, reduceDrill } from '../pages/OqcRejectDailyBoard/utils/drilldown'

describe('drill state machine', () => {
  it('resets period and batch', () => {
    const s = reduceDrill(
      { period: makePeriod('day', '2026-08-27', '08-27'), batchNo: 'B1' },
      { type: 'reset' },
    )
    expect(s).toEqual(initialDrillState())
  })

  it('NG select sets period and clears batch', () => {
    const period = makePeriod('week', '2026-08-23', '08/23-08/29')
    const s = reduceDrill({ period: null, batchNo: 'OLD' }, { type: 'selectNg', period })
    expect(s.period).toEqual(period)
    expect(s.batchNo).toBeNull()
  })

  it('batch select keeps period', () => {
    const period = makePeriod('month', '2026-08', '2026-08')
    const s = reduceDrill({ period, batchNo: null }, { type: 'selectBatch', batchNo: 'F1-1' })
    expect(s.period).toEqual(period)
    expect(s.batchNo).toBe('F1-1')
  })

  it('noNg leaves state unchanged (defects not refreshed by reducer)', () => {
    const prev = { period: makePeriod('day', 'k', 'l'), batchNo: 'X' }
    expect(reduceDrill(prev, { type: 'noNg' })).toEqual(prev)
  })
})
