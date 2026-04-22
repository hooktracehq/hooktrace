import type { JsonValue } from "./json"

export type EventDetail = {
  id: number
  token: string
  route: string
  provider: string | null
  event_type?: string | null
  status: "pending" | "delivered" | "failed" | "retrying"
  attempt_count: number | null
  headers: JsonValue
  payload: JsonValue
  created_at: string
  delivery_target?: string | null
  idempotency_key?: string | null
  last_error?: string | null
}