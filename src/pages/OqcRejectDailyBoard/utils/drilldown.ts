import type { DrillPeriod, Grain } from '../types'

export interface DrillState {
  period: DrillPeriod | null
  batchNo: string | null
}

export type DrillAction =
  | { type: 'reset' }
  | { type: 'selectNg'; period: DrillPeriod }
  | { type: 'selectBatch'; batchNo: string }
  | { type: 'noNg' }

export function initialDrillState(): DrillState {
  return { period: null, batchNo: null }
}

/**
 * Drill state machine (design.md §3.4):
 * - reset on date/tab change
 * - NG bar → set period, clear batch
 * - batch → set batchNo
 * - OK / no NG → no defect refresh (caller shows toast); state unchanged for defects
 */
export function reduceDrill(state: DrillState, action: DrillAction): DrillState {
  switch (action.type) {
    case 'reset':
      return initialDrillState()
    case 'selectNg':
      return { period: action.period, batchNo: null }
    case 'selectBatch':
      return { ...state, batchNo: action.batchNo }
    case 'noNg':
      return state
    default:
      return state
  }
}

export function makePeriod(grain: Grain, key: string, label: string): DrillPeriod {
  return { grain, key, label }
}
