"use client"

import {
  Layers3,
  Activity,
  Settings2,
  BarChart3,
} from "lucide-react"

import type { AggregationRule } from "@/types/aggregation"

type Props = {
  rule: AggregationRule | null
}

export function AggregationInspector({
  rule,
}: Props) {
  if (!rule) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <Layers3 className="mb-4 h-12 w-12 text-muted-foreground/30" />

        <h3 className="font-semibold">
          No Rule Selected
        </h3>

        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Select an aggregation rule from the list to inspect its
          configuration and batching performance.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-auto">

      {/* Header */}

      <div className="border-b border-border p-6">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <Layers3 className="h-6 w-6 text-orange-400" />

            <div>

              <h2 className="text-lg font-semibold">
                {rule.name}
              </h2>

              <p className="text-sm text-muted-foreground">
                Aggregation Rule
              </p>

            </div>

          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              rule.enabled
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {rule.enabled ? "Enabled" : "Disabled"}
          </span>

        </div>

      </div>

      <div className="space-y-8 p-6">

        {/* Overview */}

        <Section
          icon={<Activity className="h-4 w-4" />}
          title="Overview"
        >
          <Info
            label="Provider"
            value={rule.provider ?? "Any"}
          />

          <Info
            label="Mode"
            value={capitalize(rule.config.mode)}
          />

          <Info
            label="Created"
            value={
              rule.createdAt
                ? new Date(
                    rule.createdAt
                  ).toLocaleString()
                : "-"
            }
          />

          <Info
            label="Last Triggered"
            value={
              rule.lastTriggered
                ? new Date(
                    rule.lastTriggered
                  ).toLocaleString()
                : "Never"
            }
          />
        </Section>

        {/* Configuration */}

        <Section
          icon={<Settings2 className="h-4 w-4" />}
          title="Configuration"
        >
          <Info
            label="Window"
            value={
              rule.config.windowMs
                ? `${rule.config.windowMs} ms`
                : "-"
            }
          />

          <Info
            label="Maximum Batch"
            value={
              rule.config.maxBatchSize ??
              "-"
            }
          />

          <Info
            label="Timeout"
            value={
              rule.config.timeoutMs
                ? `${rule.config.timeoutMs} ms`
                : "-"
            }
          />

          <Info
            label="Rate Limit"
            value={
              rule.config
                .maxEventsPerSecond
                ? `${rule.config.maxEventsPerSecond}/sec`
                : "-"
            }
          />

          <Info
            label="Deduplication"
            value={
              rule.config.deduplicate
                ? "Enabled"
                : "Disabled"
            }
          />
        </Section>

        {/* Performance */}

        <Section
          icon={<BarChart3 className="h-4 w-4" />}
          title="Performance"
        >
          <Info
            label="Events Processed"
            value={rule.stats.eventsProcessed.toLocaleString()}
          />

          <Info
            label="Batches Created"
            value={rule.stats.batchesCreated.toLocaleString()}
          />

          <Info
            label="Average Batch"
            value={rule.stats.averageBatchSize.toFixed(
              1
            )}
          />

          <Info
            label="Duplicates Skipped"
            value={rule.stats.duplicatesSkipped.toLocaleString()}
          />
        </Section>

        {/* Event Patterns */}

        <div>

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Event Patterns
          </h3>

          <div className="flex flex-wrap gap-2">

            {rule.eventPatterns.map(
              (pattern) => (
                <span
                  key={pattern}
                  className="rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs font-medium"
                >
                  {pattern}
                </span>
              )
            )}

          </div>

        </div>

      </div>

    </div>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>

      <div className="mb-4 flex items-center gap-2">

        {icon}

        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>

      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">

        {children}

      </div>

    </div>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="text-sm font-medium text-right">
        {value}
      </span>

    </div>
  )
}

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  )
}