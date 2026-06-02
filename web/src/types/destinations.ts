export type DestinationStatus =
  | "healthy"
  | "failed"
  | "paused"

export interface Destination {
  id: string

  name: string

  status: DestinationStatus

  delivered: number

  latency: string

  lastSeen: string

  endpoint: string

  method: string

  retries: number

  successRate: number

  createdAt: string
}