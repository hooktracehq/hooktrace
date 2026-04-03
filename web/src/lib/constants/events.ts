export type WebhookEvent = {
    id: number
    route?: string
    provider?: string
    status: "pending" | "delivered" | "failed"
    attempt_count?: number
    created_at: string
    last_error?: string | null
  }