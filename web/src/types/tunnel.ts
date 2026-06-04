export type TunnelStatus =
  | "active"
  | "paused"
  | "offline"
  | "error"

export interface Tunnel {
  id: string

  name: string

  publicUrl: string

  targetUrl: string

  status: TunnelStatus

  requestCount: number

  bytesTransferred: number

  avgResponseTime: number

  createdAt: string

  lastSeen: string

  provider?: string

  region?: string

  tlsEnabled?: boolean
}