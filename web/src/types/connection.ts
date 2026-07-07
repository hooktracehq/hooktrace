export interface Connection {
  provider: string

  status: string

  route: string

  webhookUrl: string

  createdAt: string | null
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