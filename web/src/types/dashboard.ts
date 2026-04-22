/* ---------------- Dashboard Types ---------------- */

export type Stat = {
    label: string
    value: number
  }
  
  /* ---------- User ---------- */
  
  export type DashboardUser = {
    email: string
    avatar_url?: string
    name?: string
  }
  
  /* ---------- Metrics ---------- */
  
  export type TimeSeriesPoint = [number, string]
  
  export type MetricsData = {
    incoming: TimeSeriesPoint[]
    delivered: TimeSeriesPoint[]
    failed: TimeSeriesPoint[]
    latency: TimeSeriesPoint[]
  }
  
  /* ---------- Events ---------- */
  
  export type DashboardEventStatus =
    | "pending"
    | "delivered"
    | "failed"
  
  export type DashboardEvent = {
    id: number
    provider: string | null  
    status: DashboardEventStatus
    created_at: string
  }
  
  /* ---------- Endpoints ---------- */
  
  export type EndpointMode = "dev" | "prod"
  
  export type Endpoint = {
    id: number
    token: string
    route: string
    mode: EndpointMode
  }
  
  /* ---------- Props ---------- */
  
  export type DashboardProps = {
    stats: Stat[]
    user: DashboardUser
    successSeries?: TimeSeriesPoint[]
    failureSeries?: TimeSeriesPoint[]
    recentEvents?: DashboardEvent[]
    endpoints?: Endpoint[]
  }