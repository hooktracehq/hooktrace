export interface Connection {
  provider: string

  status: string

  route: string

  webhook_url: string

  created_at
  : string | null
}

export interface ConnectionsResponse {
  items: Connection[]
}

export interface ConnectProviderResponse {
  provider: string

  connected?: boolean

  alreadyConnected?: boolean

  webhookUrl: string
}

export interface DeleteConnectionResponse {
  success: boolean

  provider: string
}

export interface ConnectionsStatsResponse {
  providers: number
  healthy: number
  errors: number
  events_today: number
}