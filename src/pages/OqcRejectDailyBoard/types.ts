export type TabKey = 'total' | 'bga' | 'uhd' | 'config'
export type Category = 'total' | 'bga' | 'uhd'
export type Grain = 'month' | 'week' | 'day'

export interface PeriodMetrics {
  inspectBatchCount: number
  okBatchCount: number
  ngBatchCount: number
  inspectQty: number
  rejectQty: number
  actualDppm: number
  targetDppm: number
}

export interface WindowPoint {
  key: string
  label: string
  okBatchCount: number
  ngBatchCount: number
  actualDppm: number
  targetDppm: number
  metrics: PeriodMetrics
}

export interface SummaryResponse {
  date: string
  category: Category
  windows: {
    month: WindowPoint[]
    week: WindowPoint[]
    day: WindowPoint[]
  }
}

export interface NgBatchItem {
  batchNo: string
  product?: string
  category?: string
  yieldRate?: number
  rejectQty?: number
  inspectQty?: number
  defectSummary?: string
  [key: string]: unknown
}

export interface NgBatchesResponse {
  items: NgBatchItem[]
}

export interface DefectItem {
  defectCode?: string
  defectName?: string
  qty?: number
  location?: string
  remark?: string
  [key: string]: unknown
}

export interface DefectsResponse {
  batchNo: string
  items: DefectItem[]
}

export interface DppmTargetItem {
  id: string
  category: Category | 'all'
  targetDppm: number
  effectiveFrom?: string
  remark?: string
}

export interface DppmTargetConfig {
  items: DppmTargetItem[]
}

export interface DrillPeriod {
  grain: Grain
  key: string
  label: string
}
