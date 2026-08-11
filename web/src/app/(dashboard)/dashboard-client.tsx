// "use client"

// import { useEffect, useState } from "react"

// import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
// import { ThroughputChart } from "@/components/dashboard/throughput-chart"
// import { RecentEvents } from "@/components/dashboard/recent-events"
// import { RecentFailures } from "@/components/dashboard/recent-failures"
// import { ProviderBreakdown } from "@/components/dashboard/provider-breakdown"
// import { InfrastructureOverview } from "@/components/dashboard/infrastructure-overview"

// type DashboardStats = {
//   incoming: number
//   delivered: number
//   failed: number
//   retries: number
//   dlq: number
//   avg_latency_ms: number
// }

// type DashboardEvent = {
//   id: number
//   provider: string
//   event_type: string
//   status: string
//   route: string
//   latency_ms: number | null
//   attempt_count: number
//   retry_count: number
//   last_error: string | null
//   created_at: string
// }

// type DashboardFailure = DashboardEvent

// type DashboardProvider = {
//   name: string
//   count: number
//   percentage: number
// }

// type Infrastructure = {
//   connections: {
//     total: number
//     healthy: number
//     errors: number
//   }

//   routes: {
//     total: number
//   }

//   destinations: {
//     total: number
//     healthy: number
//     paused: number
//     delivered: number
//     failed: number
//   }

//   aggregation: {
//     total: number
//     enabled: number
//     events_processed: number
//     batches_created: number
//     duplicates_skipped: number
//   }

//   tunnels: {
//     total: number
//     active: number
//     inactive: number
//     requests: number
//   }
// }

// type ActivityPoint = {
//   timestamp: number
//   success: number
//   failure: number
// }

// type DashboardResponse = {
//   stats: DashboardStats
//   activity: ActivityPoint[]
//   providers: DashboardProvider[]
//   infrastructure: Infrastructure
//   recent_events: DashboardEvent[]
//   recent_failures: DashboardFailure[]
// }

// export function DashboardClient() {
//   const [data, setData] =
//     useState<DashboardResponse | null>(null)

//   const [loading, setLoading] =
//     useState(true)

//   const [error, setError] =
//     useState<string | null>(null)

//   useEffect(() => {
//     let cancelled = false

//     async function loadDashboard() {
//       try {
//         setLoading(true)
//         setError(null)

//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/dashboard/overview`,
//           {
//             method: "GET",
//             credentials: "include",
//             headers: {
//               Accept: "application/json",
//             },
//             cache: "no-store",
//           }
//         )

//         if (!response.ok) {
//           throw new Error(
//             `Dashboard request failed (${response.status})`
//           )
//         }

//         const result =
//           (await response.json()) as DashboardResponse

//         if (!cancelled) {
//           setData(result)
//         }
//       } catch (err) {
//         if (!cancelled) {
//           setError(
//             err instanceof Error
//               ? err.message
//               : "Unable to load dashboard"
//           )
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false)
//         }
//       }
//     }

//     loadDashboard()

//     return () => {
//       cancelled = true
//     }
//   }, [])

//   if (loading && !data) {
//     return (
//       <div className="space-y-6">
//         <div className="h-24 animate-pulse rounded-2xl border border-border bg-surface-1" />

//         <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
//           {Array.from({ length: 6 }).map((_, index) => (
//             <div
//               key={index}
//               className="h-36 animate-pulse rounded-2xl border border-border bg-surface-1"
//             />
//           ))}
//         </div>

//         <div className="h-[390px] animate-pulse rounded-2xl border border-border bg-surface-1" />
//       </div>
//     )
//   }

//   if (error && !data) {
//     return (
//       <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-6">
//         <p className="text-sm font-medium text-rose-400">
//           Unable to load dashboard
//         </p>

//         <p className="mt-1 text-xs text-muted-foreground">
//           {error}
//         </p>
//       </div>
//     )
//   }

//   if (!data) {
//     return null
//   }

//   return (
//     <div className="space-y-6">
//       <DashboardOverview
//         stats={data.stats}
//       />

//       <ThroughputChart
//         activity={data.activity}
//       />

//       <div className="grid grid-cols-12 gap-6">
//         <div className="col-span-12 xl:col-span-7">
//           <div className="h-full rounded-2xl border border-border bg-surface-1 p-6">
//             <RecentEvents
//               events={data.recent_events}
//             />
//           </div>
//         </div>

//         <div className="col-span-12 xl:col-span-5">
//           <div className="h-full rounded-2xl border border-border bg-surface-1 p-6">
//             <RecentFailures
//               failures={data.recent_failures}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-12 gap-6">
//         <div className="col-span-12 xl:col-span-5">
//           <ProviderBreakdown
//             providers={data.providers}
//           />
//         </div>

//         <div className="col-span-12 xl:col-span-7">
//           <div className="h-full rounded-2xl border border-border bg-surface-1 p-6">
//             <InfrastructureOverview
//               infrastructure={
//                 data.infrastructure
//               }
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }




// "use client"

// import { useCallback, useEffect, useState } from "react"
// import { motion, useReducedMotion } from "framer-motion"

// import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
// import { ThroughputChart } from "@/components/dashboard/throughput-chart"
// import { RecentEvents } from "@/components/dashboard/recent-events"
// import { RecentFailures } from "@/components/dashboard/recent-failures"
// import { ProviderBreakdown } from "@/components/dashboard/provider-breakdown"
// import { InfrastructureOverview } from "@/components/dashboard/infrastructure-overview"

// type DashboardStats = {
//   incoming: number
//   delivered: number
//   failed: number
//   retries: number
//   dlq: number
//   avg_latency_ms: number
// }

// type DashboardEvent = {
//   id: number
//   provider: string
//   event_type: string
//   status: string
//   route: string
//   latency_ms: number | null
//   attempt_count: number
//   retry_count: number
//   last_error: string | null
//   created_at: string
// }

// type DashboardFailure = DashboardEvent

// type DashboardProvider = {
//   name: string
//   count: number
//   percentage: number
// }

// type Infrastructure = {
//   connections: {
//     total: number
//     healthy: number
//     errors: number
//   }

//   routes: {
//     total: number
//   }

//   destinations: {
//     total: number
//     healthy: number
//     paused: number
//     delivered: number
//     failed: number
//   }

//   aggregation: {
//     total: number
//     enabled: number
//     events_processed: number
//     batches_created: number
//     duplicates_skipped: number
//   }

//   tunnels: {
//     total: number
//     active: number
//     inactive: number
//     requests: number
//   }
// }

// type ActivityPoint = {
//   timestamp: number
//   success: number
//   failure: number
// }

// type DashboardResponse = {
//   stats: DashboardStats
//   activity: ActivityPoint[]
//   providers: DashboardProvider[]
//   infrastructure: Infrastructure
//   recent_events: DashboardEvent[]
//   recent_failures: DashboardFailure[]
// }

// // Mirrors the true layout below (KPI row -> chart -> events/failures ->
// // provider/infra) so the loading state doesn't jump or reflow once data
// // arrives.
// function DashboardSkeleton() {
//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
//         {Array.from({ length: 6 }).map((_, index) => (
//           <div
//             key={index}
//             className="h-36 animate-pulse rounded-2xl border border-border bg-surface-1"
//           />
//         ))}
//       </div>

//       <div className="h-[390px] animate-pulse rounded-2xl border border-border bg-surface-1" />

//       <div className="grid grid-cols-12 gap-6">
//         <div className="col-span-12 h-[360px] animate-pulse rounded-2xl border border-border bg-surface-1 xl:col-span-7" />
//         <div className="col-span-12 h-[360px] animate-pulse rounded-2xl border border-border bg-surface-1 xl:col-span-5" />
//       </div>

//       <div className="grid grid-cols-12 gap-6">
//         <div className="col-span-12 h-[280px] animate-pulse rounded-2xl border border-border bg-surface-1 xl:col-span-5" />
//         <div className="col-span-12 h-[280px] animate-pulse rounded-2xl border border-border bg-surface-1 xl:col-span-7" />
//       </div>
//     </div>
//   )
// }

// const sectionVariants = {
//   hidden: { opacity: 0, y: 8 },
//   visible: { opacity: 1, y: 0 },
// }

// export function DashboardClient() {
//   const [data, setData] =
//     useState<DashboardResponse | null>(null)

//   const [loading, setLoading] =
//     useState(true)

//   const [error, setError] =
//     useState<string | null>(null)

//   const prefersReducedMotion = useReducedMotion()

//   const loadDashboard = useCallback(async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/dashboard/overview`,
//         {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             Accept: "application/json",
//           },
//           cache: "no-store",
//         }
//       )

//       if (!response.ok) {
//         throw new Error(
//           `Dashboard request failed (${response.status})`
//         )
//       }

//       const result =
//         (await response.json()) as DashboardResponse

//       setData(result)
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Unable to load dashboard"
//       )
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     let cancelled = false

//     async function run() {
//       await loadDashboard()
//       if (cancelled) return
//     }

//     run()

//     return () => {
//       cancelled = true
//     }
//   }, [loadDashboard])

//   if (loading && !data) {
//     return <DashboardSkeleton />
//   }

//   if (error && !data) {
//     return (
//       <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-6 text-center">
//         <p className="text-sm font-medium text-rose-400">
//           Unable to load dashboard
//         </p>

//         <p className="mt-1 max-w-sm text-xs text-muted-foreground">
//           {error}
//         </p>

//         <button
//           type="button"
//           onClick={loadDashboard}
//           className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
//         >
//           Try again
//         </button>
//       </div>
//     )
//   }

//   if (!data) {
//     return null
//   }

//   // Refetches quietly on retry after a transient error, without dropping
//   // the last good data or forcing the page back into a full skeleton.
//   const staleNotice = error ? (
//     <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-500/20 bg-orange-500/[0.04] px-4 py-2.5 text-xs text-orange-300">
//       <span>Showing last loaded data — {error}</span>

//       <button
//         type="button"
//         onClick={loadDashboard}
//         className="shrink-0 font-medium underline decoration-dotted underline-offset-2 hover:text-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
//       >
//         Retry
//       </button>
//     </div>
//   ) : null

//   return (
//     <div className="space-y-6">
//       {staleNotice}

//       <motion.div
//         initial={prefersReducedMotion ? false : "hidden"}
//         animate="visible"
//         variants={sectionVariants}
//         transition={{ duration: 0.2 }}
//       >
//         <DashboardOverview
//           stats={data.stats}
//         />
//       </motion.div>

//       <motion.div
//         initial={prefersReducedMotion ? false : "hidden"}
//         animate="visible"
//         variants={sectionVariants}
//         transition={{ duration: 0.2, delay: 0.05 }}
//       >
//         <ThroughputChart
//           activity={data.activity}
//         />
//       </motion.div>

//       <motion.div
//         className="grid grid-cols-12 gap-6"
//         initial={prefersReducedMotion ? false : "hidden"}
//         animate="visible"
//         variants={sectionVariants}
//         transition={{ duration: 0.2, delay: 0.1 }}
//       >
//         <div className="col-span-12 xl:col-span-7">
//           <div className="h-full rounded-2xl border border-border bg-surface-1 p-6">
//             <RecentEvents
//               events={data.recent_events}
//             />
//           </div>
//         </div>

//         <div className="col-span-12 xl:col-span-5">
//           <div className="h-full rounded-2xl border border-border bg-surface-1 p-6">
//             <RecentFailures
//               failures={data.recent_failures}
//             />
//           </div>
//         </div>
//       </motion.div>

//       <motion.div
//         className="grid grid-cols-12 gap-6"
//         initial={prefersReducedMotion ? false : "hidden"}
//         animate="visible"
//         variants={sectionVariants}
//         transition={{ duration: 0.2, delay: 0.15 }}
//       >
//         <div className="col-span-12 xl:col-span-5">
//           <ProviderBreakdown
//             providers={data.providers}
//           />
//         </div>

//         <div className="col-span-12 xl:col-span-7">
//           <div className="h-full rounded-2xl border border-border bg-surface-1 p-6">
//             <InfrastructureOverview
//               infrastructure={
//                 data.infrastructure
//               }
//             />
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   )
// }









"use client"

import { useCallback, useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ThroughputChart } from "@/components/dashboard/throughput-chart"
import { RecentEvents } from "@/components/dashboard/recent-events"
import { RecentFailures } from "@/components/dashboard/recent-failures"
import { ProviderBreakdown } from "@/components/dashboard/provider-breakdown"
import { InfrastructureOverview } from "@/components/dashboard/infrastructure-overview"

type DashboardStats = {
  incoming: number
  delivered: number
  failed: number
  retries: number
  dlq: number
  avg_latency_ms: number
}

export type DashboardEvent = {
  id: number
  provider: string
  event_type: string
  status: string
  route: string
  latency_ms: number | null
  attempt_count: number
  retry_count: number
  last_error: string | null
  created_at: string
}

export type DashboardFailure = DashboardEvent

type DashboardProvider = {
  name: string
  count: number
  percentage: number
}

type Infrastructure = {
  connections: {
    total: number
    healthy: number
    errors: number
  }

  routes: {
    total: number
  }

  destinations: {
    total: number
    healthy: number
    paused: number
    delivered: number
    failed: number
  }

  aggregation: {
    total: number
    enabled: number
    events_processed: number
    batches_created: number
    duplicates_skipped: number
  }

  tunnels: {
    total: number
    active: number
    inactive: number
    requests: number
  }
}

type ActivityPoint = {
  timestamp: number
  success: number
  failure: number
}

type DashboardResponse = {
  stats: DashboardStats
  activity: ActivityPoint[]
  providers: DashboardProvider[]
  infrastructure?: Infrastructure | null
  recent_events: DashboardEvent[]
  recent_failures: DashboardFailure[]
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-border bg-surface-1"
          />
        ))}
      </div>

      <div className="h-[390px] animate-pulse rounded-2xl border border-border bg-surface-1" />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 h-[360px] animate-pulse rounded-2xl border border-border bg-surface-1 xl:col-span-7" />

        <div className="col-span-12 h-[360px] animate-pulse rounded-2xl border border-border bg-surface-1 xl:col-span-5" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 h-[280px] animate-pulse rounded-2xl border border-border bg-surface-1 xl:col-span-5" />

        <div className="col-span-12 h-[280px] animate-pulse rounded-2xl border border-border bg-surface-1 xl:col-span-7" />
      </div>
    </div>
  )
}

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },

  visible: {
    opacity: 1,
    y: 0,
  },
}

export function DashboardClient() {
  const [data, setData] =
    useState<DashboardResponse | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const prefersReducedMotion =
    useReducedMotion()

  const loadDashboard = useCallback(
    async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/overview`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        )

        if (!response.ok) {
          throw new Error(
            `Dashboard request failed (${response.status})`
          )
        }

        const result =
          (await response.json()) as DashboardResponse

        setData(result)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard"
        )
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (loading && !data) {
    return <DashboardSkeleton />
  }

  if (error && !data) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-6 text-center">
        <p className="text-sm font-medium text-rose-400">
          Unable to load dashboard
        </p>

        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {error}
        </p>

        <button
          type="button"
          onClick={loadDashboard}
          className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const staleNotice = error ? (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-500/20 bg-orange-500/[0.04] px-4 py-2.5 text-xs text-orange-300">
      <span>
        Showing last loaded data — {error}
      </span>

      <button
        type="button"
        onClick={loadDashboard}
        className="shrink-0 font-medium underline decoration-dotted underline-offset-2 hover:text-orange-200"
      >
        Retry
      </button>
    </div>
  ) : null

  return (
    <div className="space-y-6">
      {staleNotice}

      <motion.div
        initial={
          prefersReducedMotion
            ? false
            : "hidden"
        }
        animate="visible"
        variants={sectionVariants}
        transition={{
          duration: 0.2,
        }}
      >
        <DashboardOverview
          stats={data.stats}
        />
      </motion.div>

      <motion.div
        initial={
          prefersReducedMotion
            ? false
            : "hidden"
        }
        animate="visible"
        variants={sectionVariants}
        transition={{
          duration: 0.2,
          delay: 0.05,
        }}
      >
        <div className="rounded-2xl border border-border bg-surface-1 p-6">
          <ThroughputChart
            activity={data.activity}
          />
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-12 gap-6"
        initial={
          prefersReducedMotion
            ? false
            : "hidden"
        }
        animate="visible"
        variants={sectionVariants}
        transition={{
          duration: 0.2,
          delay: 0.1,
        }}
      >
        <div className="col-span-12 xl:col-span-7">
          <div className="h-full rounded-2xl border border-border bg-surface-1 p-6">
            <RecentEvents
              events={data.recent_events}
            />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5">
          <div className="h-full rounded-2xl border border-border bg-surface-1 p-6">
            <RecentFailures
              failures={data.recent_failures}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-12 gap-6"
        initial={
          prefersReducedMotion
            ? false
            : "hidden"
        }
        animate="visible"
        variants={sectionVariants}
        transition={{
          duration: 0.2,
          delay: 0.15,
        }}
      >
        <div className="col-span-12 xl:col-span-5">
          <ProviderBreakdown
            providers={data.providers}
          />
        </div>

        {data.infrastructure && (
          <div className="col-span-12 xl:col-span-7">
            <InfrastructureOverview
              infrastructure={
                data.infrastructure
              }
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}