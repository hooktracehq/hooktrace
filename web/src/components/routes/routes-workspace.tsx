"use client"

import { useEffect, useMemo, useState } from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { RoutesToolbar } from "./routes-toolbar"
import { RoutesStats } from "./routes-stats"
import { RoutesStream } from "./routes-stream"
import { RouteInspector } from "./route-inspector"

import { useRoutes } from "@/hooks/routes/use-routes"

import type { Route } from "@/types/route"

export function RoutesWorkspace() {
  const {
    routes,
    loading,
    error,
    refetch,
  } = useRoutes()

  const [query, setQuery] =
    useState("")

  const [selected, setSelected] =
    useState<Route | null>(null)

  const filtered = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase()

    if (!normalizedQuery) {
      return routes
    }

    return routes.filter((route) =>
      [
        route.provider,
        route.path,
        route.mode,
        route.status,
        route.devTarget,
        route.prodTarget,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [routes, query])

  useEffect(() => {
    if (routes.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(null)
      return
    }

    setSelected((current) => {
      if (!current) {
        return routes[0]
      }

      const updated =
        routes.find(
          (route) =>
            route.id === current.id
        )

      return updated ?? routes[0]
    })
  }, [routes])

  const activeRoute =
    selected &&
    filtered.some(
      (route) =>
        route.id === selected.id
    )
      ? selected
      : filtered[0] ?? null

  return (
    <div
      className="
        flex h-[calc(100vh-92px)]
        flex-col overflow-hidden
        rounded-2xl border border-border
        bg-surface-1
      "
    >
      <RoutesToolbar
        query={query}
        setQuery={setQuery}
      />

      <RoutesStats
        routes={filtered}
      />

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading routes...
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-rose-400">
            Failed to load routes
          </p>

          <p className="max-w-md text-xs text-muted-foreground">
            {error}
          </p>

          <button
            type="button"
            onClick={refetch}
            className="
              rounded-lg border border-border
              px-3 py-2 text-sm
              transition-colors
              hover:bg-accent
            "
          >
            Try again
          </button>
        </div>
      ) : routes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md text-center">
            <h3 className="text-lg font-semibold">
              No routes yet
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Create a route to generate a
              webhook endpoint and start
              receiving events.
            </p>
          </div>
        </div>
      ) : (
        <PanelGroup direction="horizontal">
          <Panel
            defaultSize={70}
            minSize={50}
          >
            <RoutesStream
              routes={filtered}
              selected={activeRoute}
              onSelect={setSelected}
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-border/40" />

          <Panel
            defaultSize={30}
            minSize={24}
          >
            <div className="h-full border-l border-border">
              <RouteInspector
                route={activeRoute}
              />
            </div>
          </Panel>
        </PanelGroup>
      )}
    </div>
  )
}