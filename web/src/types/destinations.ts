export type DestinationStatus =
  | "healthy"
  | "failed"
  | "paused"

export interface TargetConfig {
  url?: string
  method?: string
  timeout?: number
  secret?: string
  headers?: Record<string, string> | string
  transform?: string

  brokers?: string
  topic?: string
  clientId?: string

  redisUrl?: string
  channel?: string

  queueUrl?: string
  region?: string

  host?: string
  exchange?: string
  routingKey?: string

  webhookUrl?: string

  recipients?: string
  subject?: string

  grpcUrl?: string

  retries?: number
}

export interface Destination {
  id: string

  name: string

  type: string

  enabled: boolean

  config: TargetConfig

  createdAt: string

  lastUsed: string | null

  successCount: number

  errorCount: number

  providers: string[]
}

export interface DestinationsResponse {
  items: Destination[]
}

export interface DeliveryTargetPayload {
  name: string

  type: string

  config: TargetConfig

  providers: string[]
}

export interface DestinationStats {
  targets: number

  healthy: number

  failed: number

  deliveries: number
}

export interface DeleteDestinationResponse {
  success: boolean
}

export interface TestDestinationResponse {
  success: boolean

  message?: string
}


export interface DestinationLog {
  id: string

  event_id: number | null

  target_id: string

  status: "success" | "failed"

  status_code: number | null

  response: string

  attempt: number

  created_at: string
}