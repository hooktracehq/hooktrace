import { redirect } from "next/navigation"
import { promQuery, getScalar } from "@/lib/prometheus"
import { getCurrentUser } from "@/lib/auth"
import DashboardClient from "@/app/dashboard/dashboard-client"

async function getRecentEvents() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events?limit=5`, {
    credentials: "include",
    cache: "no-store",
  })

  if (!res.ok) return []
  const data = await res.json()
  return data.items || []
}

async function getEndpoints() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routes`, {
    credentials: "include",
    cache: "no-store",
  })

  if (!res.ok) return []
  return res.json()
}

export default async function Dashboard() {
  const user = await getCurrentUser()

  if (!user) redirect("/login")

  const [totalEvents, delivered, failed, retries, events, endpoints] =
    await Promise.all([
      promQuery("sum(hooktrace_webhooks_received_total)"),
      promQuery("sum(hooktrace_events_delivered_total)"),
      promQuery("sum(hooktrace_events_failed_total)"),
      promQuery("sum(hooktrace_events_retried_total)"),
      getRecentEvents(),
      getEndpoints(),
    ])

  const stats = [
    { label: "Total Events", value: getScalar(totalEvents as unknown[]) },
    { label: "Delivered", value: getScalar(delivered as unknown[]) },
    { label: "Failed", value: getScalar(failed as unknown[]) },
    { label: "Retries", value: getScalar(retries as unknown[]) },
  ]

  return (
    <DashboardClient
      stats={stats}
      user={user}
      recentEvents={events}
      endpoints={endpoints}
    />
  )
}