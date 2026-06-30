export interface AggregationConfig {
  mode: "batch" | "window" | "rate_limit"

  windowMs?: number

  maxBatchSize?: number

  timeoutMs?: number

  maxEventsPerSecond?: number

  deduplicate?: boolean

  deduplicationKey?: string | null
}

export interface AggregationStats {
  eventsProcessed: number

  batchesCreated: number

  averageBatchSize: number

  duplicatesSkipped: number
}

export interface AggregationRule {
  id: string

  name: string

  provider?: string | null

  enabled: boolean

  eventPatterns: string[]

  config: AggregationConfig

  stats: AggregationStats

  createdAt?: string

  lastTriggered?: string | null
}

export interface AggregationResponse {
  items: AggregationRule[]
}