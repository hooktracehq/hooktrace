export type Route = {
    id: string
    path: string
    provider: string
  
    status:
      | "active"
      | "paused"
      | "error"
  
    throughput: number
  
    failures: number
  
    destinations: number
  
    lastSeen: string
  }