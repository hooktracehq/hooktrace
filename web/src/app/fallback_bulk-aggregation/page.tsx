export const dynamic = "force-dynamic"

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import BulkAggregationClient from "./bulk-aggregation-client"

type AggregationRule = {
  id: string
  name: string
  provider: string
  eventPatterns: string[]
  enabled: boolean
  config: {
    mode: "time_window" | "count" | "rate_limit"
    windowMs?: number
    maxBatchSize?: number
    timeoutMs?: number
    deduplicate?: boolean
    deduplicationKey?: string
    maxEventsPerSecond?: number
  }
  stats: {
    eventsProcessed: number
    batchesCreated: number
    averageBatchSize: number
    duplicatesSkipped: number
  }
  createdAt: string
  lastTriggered: string | null
}

export default async function BulkAggregationPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Avoid impure Date.now during render
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  // Fetching the Aggregation API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/aggregation`,
    {
      credentials: "include",
      cache: "no-store",
    }
  )
  
  const data = await res.json()
  
  const aggregationRules: AggregationRule[] = data.items || []
  return (
    <BulkAggregationClient
      user={user}
      aggregationRules={aggregationRules}
    />
  )
}