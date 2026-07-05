"use client"

import {
  Activity,
  BarChart3,
  Layers3,
  Pencil,
  Settings2,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { AggregationRule } from "@/types/aggregation"

type Props = {
  rule: AggregationRule | null

  onEdit?: (rule: AggregationRule) => void
  onDelete?: (rule: AggregationRule) => void
  onToggle?: (rule: AggregationRule) => void
}

export function AggregationInspector({
  rule,
  onEdit,
  onDelete,
  onToggle,
}: Props) {
  if (!rule) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <Layers3 className="mb-4 h-12 w-12 text-muted-foreground/30" />

        <h3 className="font-semibold">
          No Rule Selected
        </h3>

        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Select an aggregation rule to inspect its configuration and performance.
        </p>
      </div>
    )
  }



  const handleEdit = () => {
    onEdit?.(rule)
  }
  
  const handleToggle = () => {
    onToggle?.(rule)
  }
  
  const handleDelete = () => {
    onDelete?.(rule)
  }
  return (
    <div className="flex h-full flex-col overflow-auto">

      {/* Header */}

      <div className="border-b border-border p-6">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-orange-500/10 p-2">
              <Layers3 className="h-5 w-5 text-orange-500" />
            </div>

            <div>

              <h2 className="text-lg font-semibold">
                {rule.name}
              </h2>

              <div className="mt-1 flex items-center gap-2">

                <Badge
                  variant={
                    rule.enabled
                      ? "default"
                      : "secondary"
                  }
                >
                  {rule.enabled
                    ? "Enabled"
                    : "Disabled"}
                </Badge>

                <Badge
                  variant="outline"
                  className="capitalize"
                >
                  {rule.config.mode}
                </Badge>

              </div>

            </div>

          </div>

          <div className="flex gap-2">

            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                handleEdit()
              }
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleToggle()
              }
            >
              {rule.enabled
                ? "Disable"
                : "Enable"}
            </Button>

            <Button
              size="icon"
              variant="destructive"
              onClick={() =>
                handleDelete()
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>

          </div>

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

        {/* Batch Settings */}

        <Section
          icon={<Settings2 className="h-4 w-4" />}
          title="Batch Settings"
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
            label="Batch Size"
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
        </Section>

        {/* Optimization */}

        <Section
          icon={<Settings2 className="h-4 w-4" />}
          title="Optimization"
        >
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

          <Info
            label="Dedup Key"
            value={
              rule.config
                .deduplicationKey ??
              "-"
            }
          />
        </Section>

        {/* Performance */}

        <Section
          icon={<BarChart3 className="h-4 w-4" />}
          title="Performance"
        >
          <div className="grid grid-cols-2 gap-3">

            <MetricCard
              label="Processed"
              value={rule.stats.eventsProcessed.toLocaleString()}
            />

            <MetricCard
              label="Batches"
              value={rule.stats.batchesCreated.toLocaleString()}
            />

            <MetricCard
              label="Avg Batch"
              value={rule.stats.averageBatchSize.toFixed(1)}
            />

            <MetricCard
              label="Saved"
              value={rule.stats.duplicatesSkipped.toLocaleString()}
            />

          </div>
        </Section>

        {/* Event Patterns */}

        <Section
          icon={<Layers3 className="h-4 w-4" />}
          title="Event Patterns"
        >
          <div className="flex flex-wrap gap-2">

            {rule.eventPatterns.map(
              (pattern) => (
                <code
                  key={pattern}
                  className="
                    rounded-md
                    border
                    border-border
                    bg-muted
                    px-2
                    py-1
                    font-mono
                    text-xs
                  "
                >
                  {pattern}
                </code>
              )
            )}

          </div>
        </Section>

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

      <div className="mb-3 flex items-center gap-2">

        {icon}

        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>

      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4">
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
    <div className="flex items-center justify-between">

      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="text-sm font-medium">
        {value}
      </span>

    </div>
  )
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">

      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

    </div>
  )
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}