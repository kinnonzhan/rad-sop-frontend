import type {
  Category,
  DefectsResponse,
  DppmTargetConfig,
  Grain,
  NgBatchesResponse,
  SummaryResponse,
} from '../types'
import {
  buildMockDefects,
  buildMockExportCsv,
  buildMockNgBatches,
  buildMockSummary,
  getMockConfig,
  saveMockConfig,
} from './mock'

const useMock = () => (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'
const baseUrl = () => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${baseUrl()}${path}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  if (res.status === 204) return undefined as T
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json() as Promise<T>
  return res as unknown as T
}

export async function fetchSummary(date: string, category: Category): Promise<SummaryResponse> {
  if (useMock()) {
    await delay(120)
    return buildMockSummary(date, category)
  }
  const q = new URLSearchParams({ date, category })
  return request(`/api/oqc/appearance-reject/summary?${q}`)
}

export async function fetchNgBatches(
  date: string,
  category: Category,
  grain: Grain,
  periodKey: string,
): Promise<NgBatchesResponse> {
  if (useMock()) {
    await delay(100)
    return buildMockNgBatches(date, category, grain, periodKey)
  }
  const q = new URLSearchParams({ date, category, grain, periodKey })
  return request(`/api/oqc/appearance-reject/ng-batches?${q}`)
}

export async function fetchDefects(batchNo: string, date?: string, category?: Category): Promise<DefectsResponse> {
  if (useMock()) {
    await delay(80)
    return buildMockDefects(batchNo)
  }
  const q = new URLSearchParams({ batchNo })
  if (date) q.set('date', date)
  if (category) q.set('category', category)
  return request(`/api/oqc/appearance-reject/defects?${q}`)
}

export async function fetchDppmConfig(): Promise<DppmTargetConfig> {
  if (useMock()) {
    await delay(80)
    return getMockConfig()
  }
  return request('/api/oqc/appearance-reject/config/dppm-target')
}

export async function saveDppmConfig(body: DppmTargetConfig): Promise<DppmTargetConfig> {
  if (useMock()) {
    await delay(120)
    return saveMockConfig(body)
  }
  return request('/api/oqc/appearance-reject/config/dppm-target', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function exportBoard(params: {
  date: string
  category: Category
  grain?: Grain
  periodKey?: string
  summary?: SummaryResponse
  ng?: NgBatchesResponse | null
}): Promise<Blob> {
  if (useMock()) {
    const summary = params.summary || buildMockSummary(params.date, params.category)
    const ng =
      params.ng ??
      (params.grain && params.periodKey
        ? buildMockNgBatches(params.date, params.category, params.grain, params.periodKey)
        : { items: [] })
    const csv = buildMockExportCsv(summary, ng, params.grain, params.periodKey)
    return new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  }
  const q = new URLSearchParams({ date: params.date, category: params.category })
  if (params.grain) q.set('grain', params.grain)
  if (params.periodKey) q.set('periodKey', params.periodKey)
  const res = await fetch(`${baseUrl()}/api/oqc/appearance-reject/export?${q}`)
  if (!res.ok) throw new Error(`导出失败: ${res.status}`)
  return res.blob()
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export function isMockMode() {
  return useMock()
}
