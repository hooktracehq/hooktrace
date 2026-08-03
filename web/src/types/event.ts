export type Event = {
  id: number

  provider: string
  route: string
  token?: string

  status:
    | "pending"
    | "processing"
    | "retrying"
    | "delivered"
    | "failed"
    | "dlq"

  event_type: string

  latency_ms?: number

  payload_size?: number

  payload?: Record<string, unknown>

  headers?: Record<string, unknown>

  created_at: string

  attempt_count: number

  last_error?: string | null
}