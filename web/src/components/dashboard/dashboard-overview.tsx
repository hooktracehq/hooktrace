"use client"

import {
  Activity,
  AlertTriangle,
  RotateCcw,
  TimerReset,
} from "lucide-react"

import { motion } from "framer-motion"

import { KpiCard } from "./kpi-card"

import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics"

export function DashboardOverview() {

  const {
    events,
    failures,
    retries,
  } = useDashboardMetrics()

  return (
    <div
      className="
        grid gap-5
        md:grid-cols-2
        xl:grid-cols-4
      "
    >

      <motion.div
        animate={{
          scale: [1, 1.01, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        <KpiCard
          title="Total Events"
          value={events.toLocaleString()}
          change="+18.2% this hour"
          icon={Activity}
          accent="orange"
        />
      </motion.div>

      <motion.div
        animate={{
          scale: [1, 1.01, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      >
        <KpiCard
          title="Failures"
          value={failures}
          change="12 unresolved"
          icon={AlertTriangle}
          accent="red"
        />
      </motion.div>

      <motion.div
        animate={{
          scale: [1, 1.01, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      >
        <KpiCard
          title="Retries"
          value={retries}
          change="Auto replay active"
          icon={RotateCcw}
          accent="orange"
        />
      </motion.div>

      <motion.div
        animate={{
          scale: [1, 1.01, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      >
        <KpiCard
          title="Avg Latency"
          value="82ms"
          change="Healthy delivery speed"
          icon={TimerReset}
          accent="blue"
        />
      </motion.div>

    </div>
  )
}