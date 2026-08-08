export type Replay = {
    id: string
    status: string
  
    total_events: number
    completed_events: number
    failed_events: number
    running_events: number
    queued_events: number
  
    parallelism: number
  
    created_at: string
    started_at: string | null
  
    provider: string
    event_type: string
  
    attempts: number
  }