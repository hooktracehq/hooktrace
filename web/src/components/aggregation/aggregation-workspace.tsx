"use client"

import { useMemo, useState } from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { Layers3 } from "lucide-react"

import { useAggregation } from "@/hooks/aggregation/use-aggregation"
import { useCreateAggregation } from "@/hooks/aggregation/use-create-aggregation"

import { AggregationToolbar } from "./aggregation-toolbar"
import { AggregationStats } from "./aggregation-stats"
import { AggregationStream } from "./aggregation-stream"
import { AggregationInspector } from "./aggregation-inspector"

import { LoadingScreen } from "@/components/shared/loading-screen"

export function AggregationWorkspace() {

  
  const [query, setQuery] =
    useState("")

  

  const {
    data,
    isLoading,
  } = useAggregation()

  const createAggregation =
    useCreateAggregation()
  const rules =
    data?.items ?? []

  const filtered = useMemo(() => {
    const search =
      query.toLowerCase()

    return rules.filter((rule) => {
      return (
        rule.name
          .toLowerCase()
          .includes(search) ||

        (rule.provider ?? "")
          .toLowerCase()
          .includes(search) ||

        rule.eventPatterns.some((pattern) =>
          pattern
            .toLowerCase()
            .includes(search)
        )
      )
    })
  }, [rules, query])

  const [
    selectedId,
    setSelectedId,
  ] = useState<string | null>(null)

  const selected = useMemo(() => {
    if (!filtered.length) {
      return null
    }

    return (
      filtered.find(
        (rule) =>
          rule.id === selectedId
      ) ?? filtered[0]
    )
  }, [
    filtered,
    selectedId,
  ])

  if (isLoading) {
    return (
      <LoadingScreen
        title="Loading aggregation rules..."
      />
    )
  }

  return (
    <div className="flex h-[calc(100vh-92px)] flex-col overflow-hidden rounded-2xl border border-border bg-background">

      <AggregationToolbar
        query={query}
        setQuery={setQuery}
        totalRules={rules.length}
        onCreate={() => {
          createAggregation.mutate({
            name: "New Aggregation Rule",
            provider: null,
            eventPatterns: [],
            config: {
              timeoutMs: 10000,
              mode: "batch",
            },
          })
        }}
      />

      <AggregationStats
        rules={rules}
      />

      {rules.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">

          <div className="max-w-md text-center">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/40">

              <Layers3 className="h-7 w-7 text-orange-500" />

            </div>

            <h2 className="text-xl font-semibold">
              No aggregation rules yet
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Aggregation combines similar webhook events into
              batches before delivery. This reduces duplicate
              traffic, lowers API calls and improves downstream
              performance.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Create your first aggregation rule to start
              optimizing webhook delivery.
            </p>

          </div>

        </div>
      ) : (
        <PanelGroup direction="horizontal">

          <Panel
            defaultSize={70}
            minSize={45}
          >
            <AggregationStream
              rules={filtered}
              selected={selected}
              onSelect={(rule) =>
                setSelectedId(rule.id)
              }
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-border/40 transition-colors hover:bg-orange-500/30" />

          <Panel
            defaultSize={30}
            minSize={25}
          >
            <AggregationInspector
              rule={selected}
            />
          </Panel>

        </PanelGroup>
      )}
    </div>
  )
}