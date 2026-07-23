export type Event = {
  id: number
  route: string
  provider?: string
  event_type?: string

  status:
    | "pending"
    | "processing"
    | "delivered"
    | "failed"
    | "retrying"
    | "dlq"

  payload: Record<string, unknown>

  attempt_count: number | null

  created_at: string

  last_error?: string
}