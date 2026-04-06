// import { getCurrentUser } from "@/lib/auth"
// import { redirect } from "next/navigation"
// import BulkAggregationClient from "./bulk-aggregation-client"

// export default async function BulkAggregationPage() {
//   const user = await getCurrentUser()
//   if (!user) redirect("/login")

//   // In production, fetch aggregation configs from database
//   const aggregationRules = [
//     {
//       id: "rule-1",
//       name: "Stripe Payment Events",
//       provider: "stripe",
//       eventPatterns: ["payment_intent.*", "charge.*"],
//       enabled: true,
//       config: {
//         mode: "time_window",
//         windowMs: 5000, // 5 seconds
//         maxBatchSize: 50,
//         deduplicate: true,
//         deduplicationKey: "id",
//       },
//       stats: {
//         eventsProcessed: 1247,
//         batchesCreated: 89,
//         averageBatchSize: 14,
//         duplicatesSkipped: 23,
//       },
//       createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
//       lastTriggered: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
//     },
//     {
//       id: "rule-2",
//       name: "GitHub Push Events",
//       provider: "github",
//       eventPatterns: ["push"],
//       enabled: true,
//       config: {
//         mode: "count",
//         maxBatchSize: 10,
//         timeoutMs: 10000, // 10 seconds
//         deduplicate: false,
//       },
//       stats: {
//         eventsProcessed: 432,
//         batchesCreated: 44,
//         averageBatchSize: 9.8,
//         duplicatesSkipped: 0,
//       },
//       createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
//       lastTriggered: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
//     },
//   ]

//   return <BulkAggregationClient user={user} aggregationRules={aggregationRules} />
// }






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