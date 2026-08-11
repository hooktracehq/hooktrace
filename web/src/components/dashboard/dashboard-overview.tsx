// "use client"

// import {
//   Activity,
//   AlertTriangle,
//   CheckCircle2,
//   RotateCcw,
//   ShieldAlert,
//   TimerReset,
// } from "lucide-react"

// import { motion } from "framer-motion"

// import { KpiCard } from "./kpi-card"

// type DashboardStats = {
//   incoming: number
//   delivered: number
//   failed: number
//   retries: number
//   dlq: number
//   avg_latency_ms: number
// }

// type Props = {
//   stats: DashboardStats
// }

// export function DashboardOverview({
//   stats,
// }: Props) {
//   const incoming = Number(stats?.incoming) || 0
//   const delivered = Number(stats?.delivered) || 0
//   const failed = Number(stats?.failed) || 0
//   const retries = Number(stats?.retries) || 0
//   const dlq = Number(stats?.dlq) || 0
//   const latency = Number(stats?.avg_latency_ms) || 0

//   const successRate =
//     incoming > 0
//       ? (delivered / incoming) * 100
//       : 100

//   const cards = [
//     {
//       title: "Incoming",
//       value: incoming.toLocaleString(),
//       change: "Webhook events received",
//       icon: Activity,
//       accent: "orange" as const,
//     },
//     {
//       title: "Delivered",
//       value: delivered.toLocaleString(),
//       change: `${successRate.toFixed(1)}% of incoming`,
//       icon: CheckCircle2,
//       accent: "emerald" as const,
//     },
//     {
//       title: "Failures",
//       value: failed.toLocaleString(),
//       change:
//         failed > 0
//           ? "Requires attention"
//           : "No failed deliveries",
//       icon: AlertTriangle,
//       accent: "red" as const,
//     },
//     {
//       title: "Retries",
//       value: retries.toLocaleString(),
//       change:
//         retries > 0
//           ? "Retries pending"
//           : "No retries pending",
//       icon: RotateCcw,
//       accent: "orange" as const,
//     },
//     {
//       title: "DLQ",
//       value: dlq.toLocaleString(),
//       change:
//         dlq > 0
//           ? "Events need attention"
//           : "Queue is empty",
//       icon: ShieldAlert,
//       accent: "red" as const,
//     },
//     {
//       title: "Avg Latency",
//       value: `${latency}ms`,
//       change:
//         latency > 500
//           ? "Latency elevated"
//           : "Healthy delivery speed",
//       icon: TimerReset,
//       accent: "blue" as const,
//     },
//   ]

//   return (
//     <div className="grid min-w-0 grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
//       {cards.map((card, index) => (
//         <motion.div
//           key={card.title}
//           initial={{
//             opacity: 0,
//             y: 6,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//           }}
//           transition={{
//             delay: index * 0.035,
//             duration: 0.2,
//           }}
//           className="min-w-0"
//         >
//           <KpiCard {...card} />
//         </motion.div>
//       ))}
//     </div>
//   )
// }




"use client"

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  TimerReset,
} from "lucide-react"

import { motion, useReducedMotion } from "framer-motion"

import { KpiCard } from "./kpi-card"

type DashboardStats = {
  incoming: number
  delivered: number
  failed: number
  retries: number
  dlq: number
  avg_latency_ms: number
}

type Props = {
  stats: DashboardStats
}

export function DashboardOverview({
  stats,
}: Props) {
  const incoming = Number(stats?.incoming) || 0
  const delivered = Number(stats?.delivered) || 0
  const failed = Number(stats?.failed) || 0
  const retries = Number(stats?.retries) || 0
  const dlq = Number(stats?.dlq) || 0
  const latency = Number(stats?.avg_latency_ms) || 0

  const prefersReducedMotion = useReducedMotion()

  const successRate =
    incoming > 0
      ? (delivered / incoming) * 100
      : 100

  const cards = [
    {
      title: "Incoming",
      value: incoming.toLocaleString(),
      change: "Webhook events received",
      icon: Activity,
      accent: "orange" as const,
    },
    {
      title: "Delivered",
      value: delivered.toLocaleString(),
      change: `${successRate.toFixed(1)}% of incoming`,
      icon: CheckCircle2,
      accent: "emerald" as const,
    },
    {
      title: "Failures",
      value: failed.toLocaleString(),
      change:
        failed > 0
          ? "Requires attention"
          : "No failed deliveries",
      icon: AlertTriangle,
      accent: "red" as const,
    },
    {
      title: "Retries",
      value: retries.toLocaleString(),
      change:
        retries > 0
          ? "Retries pending"
          : "No retries pending",
      icon: RotateCcw,
      accent: "orange" as const,
    },
    {
      title: "DLQ",
      value: dlq.toLocaleString(),
      change:
        dlq > 0
          ? "Events need attention"
          : "Queue is empty",
      icon: ShieldAlert,
      accent: "red" as const,
    },
    {
      title: "Avg Latency",
      value: `${latency}ms`,
      change:
        latency > 500
          ? "Latency elevated"
          : "Healthy delivery speed",
      icon: TimerReset,
      accent: "blue" as const,
    },
  ]

  return (
    <div className="grid min-w-0 grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={
            prefersReducedMotion
              ? false
              : {
                  opacity: 0,
                  y: 6,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: prefersReducedMotion
              ? 0
              : index * 0.035,
            duration: 0.2,
          }}
          className="min-w-0"
        >
          <KpiCard {...card} />
        </motion.div>
      ))}
    </div>
  )
}