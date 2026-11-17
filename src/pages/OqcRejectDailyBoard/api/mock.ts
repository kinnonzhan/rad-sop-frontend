import dayjs from 'dayjs'
import type {
  Category,
  DefectsResponse,
  DppmTargetConfig,
  Grain,
  NgBatchesResponse,
  SummaryResponse,
  WindowPoint,
} from '../types'

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function metricsFor(seed: string, scale: number) {
  const h = hash(seed)
  const inspectBatchCount = 20 + (h % 40) + scale
  const ngBatchCount = h % 7
  const okBatchCount = Math.max(0, inspectBatchCount - ngBatchCount)
  const inspectQty = inspectBatchCount * (80 + (h % 40))
  const rejectQty = ngBatchCount * (2 + (h % 5))
  const actualDppm = ngBatchCount === 0 ? 0 : Math.round((rejectQty / Math.max(inspectQty, 1)) * 1_000_000)
  const targetDppm = 500 + (h % 5) * 100
  return {
    inspectBatchCount,
    okBatchCount,
    ngBatchCount,
    inspectQty,
    rejectQty,
    actualDppm,
    targetDppm,
  }
}

function point(seed: string, key: string, label: string, scale: number): WindowPoint {
  const m = metricsFor(seed, scale)
  return {
    key,
    label,
    okBatchCount: m.okBatchCount,
    ngBatchCount: m.ngBatchCount,
    actualDppm: m.actualDppm,
    targetDppm: m.targetDppm,
    metrics: m,
  }
}

/** Sunday–Saturday week key = Sunday date YYYY-MM-DD */
function weekSunday(d: dayjs.Dayjs): dayjs.Dayjs {
  const dow = d.day() // 0 Sun
  return d.subtract(dow, 'day').startOf('day')
}

export function buildMockSummary(date: string, category: Category): SummaryResponse {
  const anchor = dayjs(date)
  const monthAnchor = anchor.startOf('month')
  const month: WindowPoint[] = []
  for (let i = 2; i >= 0; i--) {
    const m = monthAnchor.subtract(i, 'month')
    const key = m.format('YYYY-MM')
    month.push(point(`${category}|m|${key}`, key, key, 10 - i))
  }

  const weekEnd = weekSunday(anchor)
  const week: WindowPoint[] = []
  for (let i = 4; i >= 0; i--) {
    const start = weekEnd.subtract(i, 'week')
    const end = start.add(6, 'day')
    const key = start.format('YYYY-MM-DD')
    const label = `${start.format('MM/DD')}-${end.format('MM/DD')}`
    week.push(point(`${category}|w|${key}`, key, label, 5 - i))
  }

  const day: WindowPoint[] = []
  for (let i = 6; i >= 0; i--) {
    const d = anchor.subtract(i, 'day')
    const key = d.format('YYYY-MM-DD')
    const label = d.format('MM-DD')
    day.push(point(`${category}|d|${key}`, key, label, 7 - i))
  }

  return { date, category, windows: { month, week, day } }
}

export function buildMockNgBatches(
  date: string,
  category: Category,
  grain: Grain,
  periodKey: string,
): NgBatchesResponse {
  const seed = `${date}|${category}|${grain}|${periodKey}`
  const h = hash(seed)
  const count = h % 5
  const items = Array.from({ length: count }, (_, i) => {
    const batchNo = `F1-${periodKey.replace(/-/g, '')}-${category.toUpperCase()}-${i + 1}`
    return {
      batchNo,
      product: category === 'bga' ? 'BGA-PKG' : category === 'uhd' ? 'UHD-PANEL' : i % 2 ? 'BGA-PKG' : 'UHD-PANEL',
      category: category === 'total' ? (i % 2 ? 'BGA' : 'UHD') : category.toUpperCase(),
      yieldRate: 90 + (h % 9) - i,
      inspectQty: 100 + h % 50,
      rejectQty: 1 + (h % 4) + i,
      defectSummary: i % 2 ? '划伤/异物' : '压伤',
    }
  })
  return { items }
}

export function buildMockDefects(batchNo: string): DefectsResponse {
  const h = hash(batchNo)
  const n = 1 + (h % 3)
  const names = ['划伤', '异物', '压伤', '污渍', '缺件']
  return {
    batchNo,
    items: Array.from({ length: n }, (_, i) => ({
      defectCode: `D${100 + (h % 50) + i}`,
      defectName: names[(h + i) % names.length],
      qty: 1 + ((h + i) % 5),
      location: `区${(i % 3) + 1}`,
      remark: '',
    })),
  }
}

let configStore: DppmTargetConfig = {
  items: [
    { id: '1', category: 'all', targetDppm: 800, effectiveFrom: '2026-01-01', remark: '厂级默认' },
    { id: '2', category: 'bga', targetDppm: 600, effectiveFrom: '2026-06-01', remark: 'BGA' },
    { id: '3', category: 'uhd', targetDppm: 900, effectiveFrom: '2026-06-01', remark: 'UHD' },
  ],
}

export function getMockConfig(): DppmTargetConfig {
  return JSON.parse(JSON.stringify(configStore))
}

export function saveMockConfig(next: DppmTargetConfig): DppmTargetConfig {
  configStore = JSON.parse(JSON.stringify(next))
  return getMockConfig()
}

export function buildMockExportCsv(
  summary: SummaryResponse,
  ng: NgBatchesResponse | null,
  grain?: Grain,
  periodKey?: string,
): string {
  const rows: string[] = []
  rows.push(`OQC外观抽检批退日报汇总,日期,${summary.date},分类,${summary.category}`)
  const metricOrder = [
    ['inspectBatchCount', '检验批数'],
    ['okBatchCount', 'OK批'],
    ['ngBatchCount', 'NG批'],
    ['inspectQty', '送检数(u)'],
    ['rejectQty', '批退数(u)'],
    ['actualDppm', '实际'],
    ['targetDppm', 'Dppm目标'],
  ] as const

  for (const grainName of ['month', 'week', 'day'] as const) {
    rows.push('')
    rows.push(`【${grainName === 'month' ? '月度' : grainName === 'week' ? '周度' : '天'}】`)
    const points = summary.windows[grainName]
    rows.push(['指标', ...points.map((p) => p.label)].join(','))
    for (const [key, label] of metricOrder) {
      rows.push([label, ...points.map((p) => String(p.metrics[key]))].join(','))
    }
  }

  rows.push('')
  rows.push(`【明细】页签=${summary.category},日期=${summary.date},周期=${grain || ''}:${periodKey || ''}`)
  rows.push('批次号,产品,分类,良率,送检数,批退数,缺陷摘要')
  for (const it of ng?.items || []) {
    rows.push(
      [it.batchNo, it.product, it.category, it.yieldRate, it.inspectQty, it.rejectQty, it.defectSummary]
        .map((v) => String(v ?? ''))
        .join(','),
    )
  }
  return rows.join('\n')
}
