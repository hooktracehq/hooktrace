"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { useAggregation } from "@/hooks/use-aggregation"

import type { AggregationRule } from "@/types/aggregation"

import { AggregationToolbar } from "./aggregation-toolbar"
import { AggregationStats } from "./aggregation-stats"
import { AggregationStream } from "./aggregation-stream"
import { AggregationInspector } from "./aggregation-inspector"
import { LoadingScreen } from "@/components/shared/loading-screen"

export function AggregationWorkspace() {
  const [query, setQuery] = useState("")

  const {
    data,
    isLoading,
  } = useAggregation()
  console.log("data:",data)

  const rules = data?.items ?? []

  console.log("rules",rules)

  const filtered = useMemo(() => {
    return rules.filter((rule) =>
      rule.name
        .toLowerCase()
        .includes(query.toLowerCase())
    )
  }, [rules, query])

  const [selectedId, setSelectedId] =
  useState<string | null>(null)

const selected = useMemo(() => {
  if (!filtered.length) {
    return null
  }

  return (
    filtered.find(
      (rule) => rule.id === selectedId
    ) ?? filtered[0]
  )
}, [filtered, selectedId])

  if (isLoading) {
    return (
      <LoadingScreen title="Loading Aggregation Rules..." />
    )
  }

  return (
    <div className="flex h-[calc(100vh-92px)] flex-col overflow-hidden rounded-2xl border border-border bg-background">

      <AggregationToolbar
        query={query}
        setQuery={setQuery}
      />

      <AggregationStats rules={rules} />

      {rules.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-semibold">
              No Aggregation Rules
            </h2>

            <p className="max-w-md text-sm text-muted-foreground">
              Aggregation lets Hooktrace batch similar webhook events,
              reduce duplicate deliveries, and lower downstream traffic.
              Create your first rule to start optimizing webhook processing.
            </p>
          </div>
        </div>
      ) : (
        <PanelGroup direction="horizontal">

          <Panel
            defaultSize={72}
            minSize={50}
          >
            <AggregationStream
              rules={filtered}
              selected={selected}
              onSelect={(rule) =>
                setSelectedId(rule.id)
              }
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-border/40 hover:bg-primary/30 transition-colors" />

          <Panel
            defaultSize={28}
            minSize={24}
          >
            <div className="h-full border-l border-border">
              <AggregationInspector
                rule={selected}
              />
            </div>
          </Panel>

        </PanelGroup>
      )}
    </div>
  )
}