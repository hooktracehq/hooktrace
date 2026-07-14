export type TunnelStatus =
  | "active"
  | "paused"
  | "offline"

export interface Tunnel {
  id: string

  name: string

  localUrl: string

  publicUrl: string

  token: string

  status: TunnelStatus

  createdAt: string

  lastUsed: string | null

  requestCount: number
}

export interface TunnelResponse {
  items: Tunnel[]
}

export interface CreateTunnelPayload {
  name: string

  local_url: string
}

export interface UpdateTunnelPayload {
  name?: string

  local_url?: string

  status?: TunnelStatus
}

export interface DeleteTunnelResponse {
  success: boolean
}

export interface TunnelLog {
  id: string

  method: string

  path: string

  statusCode: number

  duration: number

  provider: string | null

  event: string | null

  requestHeaders: Record<string, string>

  requestBody: string

  responseStatus: number

  responseBody: string

  error: string | null

  timestamp: string
}

export interface TunnelLogsResponse {
  items: TunnelLog[]
}

export interface TunnelStats {
  total: number

  success: number

  errors: number

  avgDuration: number
}