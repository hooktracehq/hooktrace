export interface Connection {
    id: string
  
    provider: string
  
    status:
      | "healthy"
      | "warning"
      | "error"
  
    accountName: string
  
    accountId: string
  
    connectedAt: string
  
    lastSync: string
  
    apiVersion: string
  
    webhookUrl: string
  
    secret: string
  
    eventsReceived: number
  
    rateLimitRemaining: number
  }