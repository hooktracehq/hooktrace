export type Event = {
    id: number
    route: string
    provider?: string
    event_type?: string
    status: "pending" | "delivered" | "failed" | "retrying"
    attempt_count: number | null
    created_at: string
    last_error?: string
  }