export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { promQuery, getScalar } from "@/lib/prometheus"
import { getCurrentUser } from "@/lib/auth"
import DashboardClient from "@/app/dashboard/dashboard-client"

/* ---------------- Types ---------------- */

type Integration = {
  id: string
  name: string
  provider: string
}

/* ---------------- Helpers ---------------- */

function parseTimeSeries(data: unknown): [number, string][] {
  if (!Array.isArray(data)) return []

  return data
    .map((item) => {
      if (
        Array.isArray(item) &&
        item.length === 2 &&
        typeof item[0] === "number"
      ) {
        return [item[0], String(item[1])]
      }
      return null
    })
    .filter(Boolean) as [number, string][]
}

/* ---------------- API ---------------- */

async function getRecentEvents() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events?limit=5`,
      { credentials: "include", cache: "no-store" }
    )

    if (!res.ok) return []

    const data = await res.json()
    return data.items || []
  } catch {
    return []
  }
}

async function getEndpoints() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/routes`,
      { credentials: "include", cache: "no-store" }
    )

    if (!res.ok) return []

    const data = await res.json()
    return data.items || data || []
  } catch {
    return []
  }
}

async function getDLQCount() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events?status=dlq`,
      { cache: "no-store" }
    )

    if (!res.ok) return 0

    const data = await res.json()
    return data.items?.length || 0
  } catch {
    return 0
  }
}

async function getIntegrations(): Promise<Integration[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/integrations`,
      { credentials: "include", cache: "no-store" }
    )

    if (!res.ok) return []

    const data = await res.json()

    return (data.items || []).map((i: Integration) => ({
      id: i.provider,
      name: i.provider,
      provider: i.provider, 
    }))
  } catch {
    return []
  }
}

/* ---------------- PAGE ---------------- */

export default async function Dashboard() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  let totalEvents: unknown = []
  let delivered: unknown = []
  let failed: unknown = []
  let retries: unknown = []
  let successSeries: unknown = []
  let failureSeries: unknown = []
  let events: unknown = []
  let endpoints: unknown = []
  let dlqCount = 0
  let integrations: Integration[] = []

  try {
    [
      totalEvents,
      delivered,
      failed,
      retries,
      successSeries,
      failureSeries,
      events,
      endpoints,
      dlqCount,
      integrations,
    ] = await Promise.all([
      promQuery("sum(hooktrace_webhooks_received_total)"),
      promQuery("sum(hooktrace_events_delivered_total)"),
      promQuery("sum(hooktrace_events_failed_total)"),
      promQuery("sum(hooktrace_events_retried_total)"),

      promQuery("rate(hooktrace_events_delivered_total[1m])"),
      promQuery("rate(hooktrace_events_failed_total[1m])"),

      getRecentEvents(),
      getEndpoints(),
      getDLQCount(),
      getIntegrations(),
    ])
  } catch (err) {
    console.error("Dashboard error:", err)
  }

  const stats = [
    {
      label: "Total Events",
      value: Array.isArray(totalEvents) ? getScalar(totalEvents) || 0 : 0,
    },
    {
      label: "Delivered",
      value: Array.isArray(delivered) ? getScalar(delivered) || 0 : 0,
    },
    {
      label: "Failed",
      value: Array.isArray(failed) ? getScalar(failed) || 0 : 0,
    },
    {
      label: "Retries",
      value: Array.isArray(retries) ? getScalar(retries) || 0 : 0,
    },
  ]

  const parsedSuccess = parseTimeSeries(successSeries)
  const parsedFailure = parseTimeSeries(failureSeries)

  const safeEvents = Array.isArray(events) ? events : []
  const safeEndpoints = Array.isArray(endpoints) ? endpoints : []

  return (
    <DashboardClient
      stats={stats}
      user={user}
      recentEvents={safeEvents}
      endpoints={safeEndpoints}
      successSeries={parsedSuccess}
      failureSeries={parsedFailure}
      dlqCount={dlqCount}
      integrations={integrations}
      latency={0}
      
    />
  )
}