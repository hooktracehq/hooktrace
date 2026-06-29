export type Delivery = {
    id: string
    target_id: number
    event_id: number
    target_name: string
    target_type: string
  
    status: "success" | "failed"
  
    status_code?: number
  
    response?: unknown
  
    attempt: number
  
    created_at: string
  }