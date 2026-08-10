"use client"

import { useCallback, useEffect, useState } from "react"

export type DashboardStats = {
  incoming: number
  delivered: number
  failed: number
  retries: number
  dlq: number
  avg_latency_ms: number
}

export type DashboardActivity = {
  timestamp: number
  success: number
  failure: number
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

export type DashboardOverview = {
  stats: DashboardStats
  activity: DashboardActivity[]
  recent_events: DashboardEvent[]
  recent_failures: DashboardFailure[]
}

export function useDashboardOverview() {
  const [data, setData] =
    useState<DashboardOverview | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)

      const response = await fetch(
        "http://localhost:3001/dashboard/overview",
        {
          credentials: "include",
          cache: "no-store",
        }
      )

      if (!response.ok) {
        throw new Error(
          `Dashboard request failed: ${response.status}`
        )
      }

      const result: DashboardOverview =
        await response.json()

      setData(result)
    } catch (error) {
      console.error(
        "Failed to load dashboard overview:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return {
    data,
    loading,
    error,
    refresh: load,
  }
}