import { apiFetch } from "@/lib/api"

export interface MetricsOverview {
  received: number
  delivered: number
  failed: number
  retried: number
  success_rate: number
  avg_latency: number
}

export interface RecentActivity {
  id: number
  provider: string
  event_type: string
  status: string
  route: string
  latency: number | null
  created_at: string
}

export interface ProviderMetric {
  provider: string
  delivered: number
  failed: number
  retried: number
  success_rate: number
}

export interface TrendPoint {
  timestamp: number
  time: string
  value: number
}

export interface DashboardStats {
  success_rate: number
  error_rate: number
  throughput: number
  p95_latency: number
}

export const metricsService = {
  async getOverview() {
    const data = await apiFetch<{
      overview: MetricsOverview
    }>("/metrics/dashboard")

    return data.overview
  },

  async getProviders() {
    const data = await apiFetch<{
      providers: ProviderMetric[]
    }>("/metrics/dashboard/providers")

    return data.providers
  },

  async getDeliveryTrend() {
    const data = await apiFetch<{
      data: TrendPoint[]
    }>("/metrics/dashboard/delivery-trend")

    return data.data
  },

  async getFailureTrend() {
    const data = await apiFetch<{
      data: TrendPoint[]
    }>("/metrics/dashboard/failure-trend")

    return data.data
  },

  async getRetryTrend() {
    const data = await apiFetch<{
      data: TrendPoint[]
    }>("/metrics/dashboard/retry-trend")

    return data.data
  },

  async getLatencyTrend() {
    const data = await apiFetch<{
      data: TrendPoint[]
    }>("/metrics/dashboard/latency-trend")

    return data.data
  },

  async getStats() {
    return apiFetch<DashboardStats>(
      "/metrics/dashboard/stats"
    )
  },



  async getRecentActivity() {
    const data = await apiFetch<{
      events: RecentActivity[]
    }>("/metrics/dashboard/recent")
  
    return data.events
  },
}


