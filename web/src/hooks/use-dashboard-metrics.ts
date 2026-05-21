"use client"

import { useEffect, useState } from "react"

export function useDashboardMetrics() {
  const [events, setEvents] =
    useState(12482)

  const [failures, setFailures] =
    useState(142)

  const [retries, setRetries] =
    useState(91)

  useEffect(() => {

    const interval =
      setInterval(() => {

        setEvents((v) =>
          v + Math.floor(Math.random() * 12)
        )

        setFailures((v) =>
          v + Math.floor(Math.random() * 2)
        )

        setRetries((v) =>
          v + Math.floor(Math.random() * 3)
        )

      }, 2000)

    return () =>
      clearInterval(interval)

  }, [])

  return {
    events,
    failures,
    retries,
  }
}