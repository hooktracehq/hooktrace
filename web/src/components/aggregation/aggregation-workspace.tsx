"use client"

import { useMemo, useState } from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import type { AggregationRule } from "@/types/aggregation"

import { AggregationToolbar } from "./aggregation-toolbar"
import { AggregationStats } from "./aggregation-stats"
import { AggregationStream } from "./aggregation-stream"
import { AggregationInspector } from "./aggregation-inspector"

const MOCK_RULES: AggregationRule[] =
  [
    {
      id: "1",
      name: "Stripe Invoice Batch",
      window: "30s",
      buffered: 1842,
      batches: 91,
      efficiency: 78,
      description:
        "Batch Stripe invoice events every 30 seconds.",
    },

    {
      id: "2",
      name: "Github Push Batch",
      window: "60s",
      buffered: 923,
      batches: 44,
      efficiency: 66,
      description:
        "Aggregate repository push events.",
    },

    {
      id: "3",
      name: "User Signup Batch",
      window: "15s",
      buffered: 431,
      batches: 28,
      efficiency: 81,
      description:
        "Group signup events before delivery.",
    },
  ]

export function AggregationWorkspace() {
  const [query, setQuery] =
    useState("")

  const [selected, setSelected] =
    useState<AggregationRule | null>(
      MOCK_RULES[0]
    )

  const filtered =
    useMemo(() => {
      return MOCK_RULES.filter(
        (rule) =>
          rule.name
            .toLowerCase()
            .includes(
              query.toLowerCase()
            )
      )
    }, [query])

  return (
    <div
      className="
        flex h-[calc(100vh-92px)]
        flex-col overflow-hidden
        rounded-2xl border border-border
        bg-surface-1
      "
    >

      <AggregationToolbar
        query={query}
        setQuery={setQuery}
      />

      <AggregationStats
        rules={filtered}
      />

      <PanelGroup direction="horizontal">

        <Panel
          defaultSize={72}
          minSize={50}
        >

          <AggregationStream
            rules={filtered}
            selected={selected}
            onSelect={setSelected}
          />

        </Panel>

        <PanelResizeHandle className="w-2 bg-border/40" />

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

    </div>
  )
}