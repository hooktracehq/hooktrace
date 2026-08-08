export type Replay = {
    id: string
  
    event_id: number
  
    status: string
  
    total_events: number
    completed_events: number
    failed_events: number
    running_events: number
    queued_events: number
  
    parallelism: number
  
    created_at: string
    started_at: string | null
    finished_at: string | null
  
    provider: string
    event_type: string
  
    attempts: number
  }