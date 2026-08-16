"use client"

import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getRoutes,
} from "@/lib/services/routes"

import type { Route } from "@/types/route"

type UseRoutesResult = {
  routes: Route[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRoutes(): UseRoutesResult {
  const [routes, setRoutes] =
    useState<Route[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const fetchRoutes =
    useCallback(async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await getRoutes()

        setRoutes(data)
      } catch (error) {
        console.error(
          "Failed to load routes:",
          error
        )

        if (
          error instanceof Error &&
          error.message === "UNAUTHORIZED"
        ) {
          window.location.href = "/login"
          return
        }

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load routes"
        )
      } finally {
        setLoading(false)
      }
    }, [])

  useEffect(() => {
    fetchRoutes()
  }, [fetchRoutes])

  return {
    routes,
    loading,
    error,
    refetch: fetchRoutes,
  }
}