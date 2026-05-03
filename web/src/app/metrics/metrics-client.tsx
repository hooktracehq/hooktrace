// "use client"

// import { motion, type Variants } from "framer-motion"
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts"

// /* ---------------- Motion ---------------- */

// const container: Variants = {
//   hidden: {},
//   show: {
//     transition: { staggerChildren: 0.08 },
//   },
// }

// const fadeUp: Variants = {
//   hidden: { opacity: 0, y: 14 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
//   },
// }

// /* ---------------- Component ---------------- */

// export default function MetricsClient({
//   latency,
//   retries,
//   rejected,
//   incoming,
//   delivered,
//   failed,
// }: {
//   latency: [number, string][]
//   retries: [number, string][]
//   rejected: [number, string][]
//   incoming: [number, string][]
//   delivered: [number, string][]
//   failed: [number, string][]
// }) {
//   const formatTime = (ts: number) =>
//     new Date(ts * 1000).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     })

//   const transform = (series?: [number, string][]) =>
//     (series || []).map(([ts, val]) => ({
//       time: formatTime(ts),
//       value: Number.isFinite(Number(val)) ? Number(val) : 0,
//     }))

//   const deliveryResults = delivered.map((point, i) => ({
//     time: formatTime(point[0]),
//     success: Number.isFinite(Number(point[1])) ? Number(point[1]) : 0,
//     failed: Number.isFinite(Number(failed[i]?.[1])) ? Number(failed[i][1]) : 0,
//   }))

//   return (
//     <motion.div
//       className="min-h-screen bg-background text-foreground"
//       variants={container}
//       initial="hidden"
//       animate="show"
//     >
//       <div className="mx-auto max-w-7xl px-6 py-10 space-y-12">

//         {/* Header */}
//         <motion.section variants={fadeUp} className="space-y-2">
//           <p className="text-xs uppercase tracking-widest text-muted-foreground">
//             Observability
//           </p>
//           <h1 className="text-3xl font-semibold">
//             System Metrics Overview
//           </h1>
//           <p className="text-sm text-muted-foreground max-w-2xl">
//             High-level monitoring for webhook throughput, failures, retries,
//             and delivery latency. Designed for quick diagnosis.
//           </p>
//         </motion.section>

//         {/* Top row */}
//         <motion.section
//           variants={container}
//           className="grid gap-6 md:grid-cols-3"
//         >
//           <MetricPanel
//             title="Delivery Latency (p95)"
//             description="End-to-end webhook delivery latency"
//             data={transform(latency)}
//           />
//           <MetricPanel
//             title="Retry Rate"
//             description="Events retried by workers"
//             data={transform(retries)}
//           />
//           <MetricPanel
//             title="Rejected Webhooks"
//             description="Failed deliveries per second"
//             data={transform(rejected)}
//           />
//         </motion.section>

//         {/* Bottom row */}
//         <motion.section
//           variants={container}
//           className="grid gap-6 md:grid-cols-2"
//         >
//           <DeliveryPanel
//             title="Delivery Results"
//             description="Successful vs failed deliveries"
//             data={deliveryResults}
//           />
//           <MetricPanel
//             title="Incoming Webhooks / sec"
//             description="Traffic hitting your API"
//             data={transform(incoming)}
//           />
//         </motion.section>
//       </div>
//     </motion.div>
//   )
// }

// /* ---------------- Panels ---------------- */

// function MetricPanel({
//   title,
//   description,
//   data,
// }: {
//   title: string
//   description?: string
//   data: { time: string; value: number }[]
// }) {
//   return (
//     <motion.div
//       variants={fadeUp}
//       whileHover={{ y: -3 }}
//       className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
//     >
//       <div className="mb-4 space-y-1">
//         <h3 className="text-sm font-medium">{title}</h3>
//         {description && (
//           <p className="text-xs text-muted-foreground">
//             {description}
//           </p>
//         )}
//       </div>

//       <ResponsiveContainer width="100%" height={160}>
//         <LineChart data={data}>
//           <CartesianGrid
//             stroke="hsl(var(--border))"
//             strokeDasharray="3 3"
//           />
//           <XAxis dataKey="time" hide />
//           <YAxis hide />
//           <Tooltip />
//           <Line
//             type="monotone"
//             dataKey="value"
//             stroke="hsl(var(--primary))"
//             strokeWidth={2.5}
//             dot={false}
//             isAnimationActive={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </motion.div>
//   )
// }

// function DeliveryPanel({
//   title,
//   description,
//   data,
// }: {
//   title: string
//   description?: string
//   data: { time: string; success: number; failed: number }[]
// }) {
//   return (
//     <motion.div
//       variants={fadeUp}
//       whileHover={{ y: -3 }}
//       className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
//     >
//       <div className="mb-4 space-y-1">
//         <h3 className="text-sm font-medium">{title}</h3>
//         {description && (
//           <p className="text-xs text-muted-foreground">
//             {description}
//           </p>
//         )}
//       </div>

//       <ResponsiveContainer width="100%" height={160}>
//         <LineChart data={data}>
//           <CartesianGrid
//             stroke="hsl(var(--border))"
//             strokeDasharray="3 3"
//           />
//           <XAxis dataKey="time" hide />
//           <YAxis hide />
//           <Tooltip />
//           <Line
//             type="monotone"
//             dataKey="success"
//             stroke="hsl(var(--secondary))"
//             strokeWidth={2.5}
//             dot={false}
//             isAnimationActive={false}
//           />
//           <Line
//             type="monotone"
//             dataKey="failed"
//             stroke="hsl(var(--primary))"
//             strokeWidth={2.5}
//             dot={false}
//             isAnimationActive={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </motion.div>
//   )
// }




// "use client"

// import { motion, type Variants } from "framer-motion"
// import { useEffect, useState } from "react"
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts"

// /* ---------------- Motion ---------------- */

// const container: Variants = {
//   hidden: {},
//   show: {
//     transition: { staggerChildren: 0.08 },
//   },
// }

// const fadeUp: Variants = {
//   hidden: { opacity: 0, y: 14 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
//   },
// }

// /* ---------------- Types ---------------- */

// type MetricsData = {
//   latency: [number, string][]
//   retries: [number, string][]
//   rejected: [number, string][]
//   incoming: [number, string][]
//   delivered: [number, string][]
//   failed: [number, string][]
//   timestamp: number
// }

// /* ---------------- Component ---------------- */

// export default function MetricsClient({
//   latency: initialLatency,
//   retries: initialRetries,
//   rejected: initialRejected,
//   incoming: initialIncoming,
//   delivered: initialDelivered,
//   failed: initialFailed,
// }: {
//   latency: [number, string][]
//   retries: [number, string][]
//   rejected: [number, string][]
//   incoming: [number, string][]
//   delivered: [number, string][]
//   failed: [number, string][]
// }) {
//   const [metrics, setMetrics] = useState<MetricsData>({
//     latency: initialLatency,
//     retries: initialRetries,
//     rejected: initialRejected,
//     incoming: initialIncoming,
//     delivered: initialDelivered,
//     failed: initialFailed,
//     timestamp: Date.now(),
//   })

//   const [isLive, setIsLive] = useState(true)
//   const [lastUpdate, setLastUpdate] = useState<string>("")

//   // Poll metrics every 5 seconds
//   useEffect(() => {
//     if (!isLive) return

//     const fetchMetrics = async () => {
//       try {
//         const response = await fetch("/api/metrics")
//         if (!response.ok) throw new Error("Failed to fetch metrics")
        
//         const data: MetricsData = await response.json()
//         setMetrics(data)
//         setLastUpdate(new Date().toLocaleTimeString())
//       } catch (error) {
//         console.error("Error fetching metrics:", error)
//       }
//     }

//     // Initial fetch
//     fetchMetrics()

//     // Set up polling
//     const interval = setInterval(fetchMetrics, 5000)

//     return () => clearInterval(interval)
//   }, [isLive])

//   const formatTime = (ts: number) =>
//     new Date(ts * 1000).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     })

//   const transform = (series?: [number, string][]) =>
//     (series || []).map(([ts, val]) => ({
//       time: formatTime(ts),
//       value: Number.isFinite(Number(val)) ? Number(val) : 0,
//     }))

//   const deliveryResults = metrics.delivered.map((point, i) => ({
//     time: formatTime(point[0]),
//     success: Number.isFinite(Number(point[1])) ? Number(point[1]) : 0,
//     failed: Number.isFinite(Number(metrics.failed[i]?.[1]))
//       ? Number(metrics.failed[i][1])
//       : 0,
//   }))

//   return (
//     <motion.div
//       className="min-h-screen bg-background text-foreground"
//       variants={container}
//       initial="hidden"
//       animate="show"
//     >
//       <div className="mx-auto max-w-7xl px-6 py-10 space-y-12">
//         {/* Header */}
//         <motion.section variants={fadeUp} className="space-y-2">
//           <div className="flex items-center justify-between">
//             <div className="space-y-2">
//               <p className="text-xs uppercase tracking-widest text-muted-foreground">
//                 Observability
//               </p>
//               <h1 className="text-3xl font-semibold">
//                 System Metrics Overview
//               </h1>
//               <p className="text-sm text-muted-foreground max-w-2xl">
//                 High-level monitoring for webhook throughput, failures, retries,
//                 and delivery latency. Designed for quick diagnosis.
//               </p>
//             </div>

//             {/* Live indicator & controls */}
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setIsLive(!isLive)}
//                 className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-all hover:bg-accent"
//               >
//                 <div
//                   className={`h-2 w-2 rounded-full transition-colors ${
//                     isLive ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
//                   }`}
//                 />
//                 {isLive ? "Live" : "Paused"}
//               </button>
//               {lastUpdate && (
//                 <span className="text-xs text-muted-foreground">
//                   Updated {lastUpdate}
//                 </span>
//               )}
//             </div>
//           </div>
//         </motion.section>

//         {/* Top row */}
//         <motion.section
//           variants={container}
//           className="grid gap-6 md:grid-cols-3"
//         >
//           <MetricPanel
//             title="Delivery Latency (p95)"
//             description="End-to-end webhook delivery latency"
//             data={transform(metrics.latency)}
//             unit="s"
//           />
//           <MetricPanel
//             title="Retry Rate"
//             description="Events retried by workers"
//             data={transform(metrics.retries)}
//             unit="ops/s"
//           />
//           <MetricPanel
//             title="Rejected Webhooks"
//             description="Failed deliveries per second"
//             data={transform(metrics.rejected)}
//             unit="ops/s"
//           />
//         </motion.section>

//         {/* Bottom row */}
//         <motion.section
//           variants={container}
//           className="grid gap-6 md:grid-cols-2"
//         >
//           <DeliveryPanel
//             title="Delivery Results"
//             description="Successful vs failed deliveries"
//             data={deliveryResults}
//           />
//           <MetricPanel
//             title="Incoming Webhooks / sec"
//             description="Traffic hitting your API"
//             data={transform(metrics.incoming)}
//             unit="ops/s"
//           />
//         </motion.section>
//       </div>
//     </motion.div>
//   )
// }

// /* ---------------- Panels ---------------- */

// function MetricPanel({
//   title,
//   description,
//   data,
//   unit,
// }: {
//   title: string
//   description?: string
//   data: { time: string; value: number }[]
//   unit?: string
// }) {
//   const latestValue = data[data.length - 1]?.value || 0
//   const previousValue = data[data.length - 2]?.value || 0
//   const change =
//     previousValue !== 0
//       ? ((latestValue - previousValue) / previousValue) * 100
//       : 0

//   return (
//     <motion.div
//       variants={fadeUp}
//       whileHover={{ y: -3 }}
//       className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
//     >
//       <div className="mb-4 space-y-1">
//         <h3 className="text-sm font-medium">{title}</h3>
//         {description && (
//           <p className="text-xs text-muted-foreground">{description}</p>
//         )}
//       </div>

//       {/* Current value display */}
//       <div className="mb-3 flex items-baseline gap-2">
//         <span className="text-2xl font-bold tabular-nums">
//           {latestValue.toFixed(2)}
//         </span>
//         {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
//         {Math.abs(change) > 0.5 && (
//           <span
//             className={`text-xs font-medium ${
//               change > 0
//                 ? "text-green-600 dark:text-green-400"
//                 : "text-red-600 dark:text-red-400"
//             }`}
//           >
//             {change > 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
//           </span>
//         )}
//       </div>

//       <ResponsiveContainer width="100%" height={160}>
//         <LineChart data={data}>
//           <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
//           <XAxis dataKey="time" hide />
//           <YAxis hide />
//           <Tooltip />
//           <Line
//             type="monotone"
//             dataKey="value"
//             stroke="hsl(var(--primary))"
//             strokeWidth={2.5}
//             dot={false}
//             isAnimationActive={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </motion.div>
//   )
// }

// function DeliveryPanel({
//   title,
//   description,
//   data,
// }: {
//   title: string
//   description?: string
//   data: { time: string; success: number; failed: number }[]
// }) {
//   const latestSuccess = data[data.length - 1]?.success || 0
//   const latestFailed = data[data.length - 1]?.failed || 0
//   const total = latestSuccess + latestFailed
//   const successRate = total > 0 ? ((latestSuccess / total) * 100).toFixed(1) : "0"

//   return (
//     <motion.div
//       variants={fadeUp}
//       whileHover={{ y: -3 }}
//       className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
//     >
//       <div className="mb-4 space-y-1">
//         <h3 className="text-sm font-medium">{title}</h3>
//         {description && (
//           <p className="text-xs text-muted-foreground">{description}</p>
//         )}
//       </div>

//       {/* Stats row */}
//       <div className="mb-3 flex items-baseline gap-4">
//         <div>
//           <p className="text-xs text-muted-foreground mb-0.5">Success Rate</p>
//           <p className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">
//             {successRate}%
//           </p>
//         </div>
//         <div>
//           <p className="text-xs text-muted-foreground mb-0.5">Delivered</p>
//           <p className="text-lg font-semibold tabular-nums">
//             {latestSuccess.toFixed(0)}
//           </p>
//         </div>
//         <div>
//           <p className="text-xs text-muted-foreground mb-0.5">Failed</p>
//           <p className="text-lg font-semibold tabular-nums text-red-600 dark:text-red-400">
//             {latestFailed.toFixed(0)}
//           </p>
//         </div>
//       </div>

//       <ResponsiveContainer width="100%" height={160}>
//         <LineChart data={data}>
//           <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
//           <XAxis dataKey="time" hide />
//           <YAxis hide />
//           <Tooltip />
//           <Line
//             type="monotone"
//             dataKey="success"
//             stroke="hsl(var(--secondary))"
//             strokeWidth={2.5}
//             dot={false}
//             isAnimationActive={false}
//           />
//           <Line
//             type="monotone"
//             dataKey="failed"
//             stroke="hsl(var(--primary))"
//             strokeWidth={2.5}
//             dot={false}
//             isAnimationActive={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </motion.div>
//   )
// }




"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

/* ---------------- Types ---------------- */

type MetricsData = {
  latency: [number, string][]
  retries: [number, string][]
  rejected: [number, string][]
  incoming: [number, string][]
  delivered: [number, string][]
  failed: [number, string][]
}

/* ---------------- Helpers ---------------- */

const latest = (series?: [number, string][]) => {
  if (!series || series.length === 0) return 0
  return Number(series[series.length - 1][1] || 0)
}

const formatTime = (ts: number) =>
  new Date(ts * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

const transform = (series?: [number, string][]) =>
  (series || []).map(([ts, val]) => ({
    time: formatTime(ts),
    value: Number(val) || 0,
  }))

/* ---------------- Component ---------------- */

export default function MetricsClient(props: MetricsData) {
  const [metrics, setMetrics] = useState(props)
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState("")

  useEffect(() => {
    if (!isLive) return

    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/metrics")
        const data = await res.json()
        setMetrics(data)
        setLastUpdate(new Date().toLocaleTimeString())
      } catch (err) {
        console.error(err)
      }
    }

    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [isLive])

  const deliveryResults = metrics.delivered.map((point, i) => ({
    time: formatTime(point[0]),
    success: Number(point[1] || 0),
    failed: Number(metrics.failed[i]?.[1] || 0),
  }))

  return (
    <div className="min-h-screen bg-background px-6 py-10 space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metrics</h1>
          <p className="text-muted-foreground text-sm">
            System performance & webhook health
          </p>
        </div>

        <button
          onClick={() => setIsLive(!isLive)}
          className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          {isLive ? "Live" : "Paused"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Incoming" value={latest(metrics.incoming)} />
        <StatCard label="Delivered" value={latest(metrics.delivered)} />
        <StatCard label="Failed" value={latest(metrics.failed)} />
        <StatCard label="Retries" value={latest(metrics.retries)} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">

        <MetricPanel
          title="Latency (p95)"
          data={transform(metrics.latency)}
          unit="s"
        />

        <MetricPanel
          title="Retry Rate"
          data={transform(metrics.retries)}
          unit="ops/s"
        />

        <MetricPanel
          title="Rejected"
          data={transform(metrics.rejected)}
          unit="ops/s"
        />

        <MetricPanel
          title="Incoming"
          data={transform(metrics.incoming)}
          unit="ops/s"
        />

        <DeliveryPanel
          title="Delivery Results"
          data={deliveryResults}
        />

      </div>

      {lastUpdate && (
        <p className="text-xs text-muted-foreground">
          Last updated: {lastUpdate}
        </p>
      )}
    </div>
  )
}

/* ---------------- UI Components ---------------- */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4 bg-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value.toFixed(0)}</p>
    </div>
  )
}

function MetricPanel({
  title,
  data,
  unit,
}: {
  title: string
  data: { time: string; value: number }[]
  unit?: string
}) {
  if (!data.length) {
    return (
      <div className="border p-4 rounded-xl text-sm text-muted-foreground">
        {title}: No data
      </div>
    )
  }

  const latestValue = data[data.length - 1].value

  return (
    <div className="rounded-xl border p-4 bg-card">
      <h3 className="text-sm mb-2">{title}</h3>

      <p className="text-xl font-bold mb-2">
        {latestValue.toFixed(2)} {unit}
      </p>

      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Tooltip formatter={(v) => `${v} ${unit || ""}`} />
          <Line dataKey="value" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function DeliveryPanel({
  title,
  data,
}: {
  title: string
  data: { time: string; success: number; failed: number }[]
}) {
  if (!data.length) {
    return (
      <div className="border p-4 rounded-xl text-sm text-muted-foreground">
        {title}: No data
      </div>
    )
  }

  const latest = data[data.length - 1]
  const total = latest.success + latest.failed
  const successRate = total ? ((latest.success / total) * 100).toFixed(1) : "0"

  return (
    <div className="rounded-xl border p-4 bg-card">
      <h3 className="text-sm mb-2">{title}</h3>

      <p className="text-xl font-bold text-green-600 mb-2">
        {successRate}% success
      </p>

      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Tooltip />
          <Line dataKey="success" stroke="green" dot={false} />
          <Line dataKey="failed" stroke="red" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}