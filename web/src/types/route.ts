export type RouteMode = "dev" | "prod"

export type RouteStatus =
  | "active"
  | "paused"
  | "error"

  export type Route = {
    id: string
  
    token: string
  
    path: string
  
    provider: string
  
    mode: "dev" | "prod"
  
    status: "active" | "paused" | "error"
  
    throughput: number
  
    failures: number
  
    destinations: number
  
    lastSeen: string | null
  
    devTarget?: string | null
  
    prodTarget?: string | null
  
    secret?: string | null
  
    createdAt?: string | null
  }