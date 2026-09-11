"use client"

import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  Plus,
  Route as RouteIcon,
  Trash2,
  X,
} from "lucide-react"

import { useEffect, useMemo, useState } from "react"

import { Route } from "@/types/route"
import type { Destination } from "@/types/destinations"
import type { AggregationRule } from "@/types/aggregation"

import {
  attachTargetToRoute,
  detachTargetFromRoute,
  getRouteTargets,
  updateRouteAggregation,
} from "@/lib/services/routes"

import { getDestinations } from "@/lib/services/destinations"
import { getAggregationRules } from "@/lib/services/aggregation"

type RouteTarget = {
  id: string
  name: string
  type: string
  config: Record<string, unknown>
  enabled: boolean
  providers: string[]
  route_enabled: boolean
  attached_at: string | null
}

type Props = {
  route: Route | null
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"

export function RouteInspector({
  route,
}: Props) {
  const [copied, setCopied] = useState(false)

  const [targets, setTargets] = useState<RouteTarget[]>([])
  const [destinations, setDestinations] =
    useState<Destination[]>([])

  const [loadingTargets, setLoadingTargets] =
    useState(false)

  const [loadingDestinations, setLoadingDestinations] =
    useState(false)

  const [showAdd, setShowAdd] = useState(false)

  const [attaching, setAttaching] =
    useState<string | null>(null)

  const [detaching, setDetaching] =
    useState<string | null>(null)

  const [error, setError] = useState<string | null>(
    null
  )

  const [aggregationRules, setAggregationRules] =
    useState<AggregationRule[]>([])

  const [loadingAggregationRules, setLoadingAggregationRules] =
    useState(false)

  const [aggregationEnabled, setAggregationEnabled] =
    useState(false)

  const [aggregationRuleId, setAggregationRuleId] =
    useState<string | null>(null)

  const [savingAggregation, setSavingAggregation] =
    useState(false)

  const endpoint = route
    ? `${API_URL}/r/${route.token}/${route.path}`
    : ""

  async function loadTargets(routeId: string) {
    setLoadingTargets(true)
    setError(null)

    try {
      const response =
        await getRouteTargets(routeId)

      setTargets(response.items ?? [])
    } catch (error) {
      console.error(
        "Failed to load route targets:",
        error
      )

      setTargets([])

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load delivery targets"
      )
    } finally {
      setLoadingTargets(false)
    }
  }

  async function loadDestinations() {
    setLoadingDestinations(true)

    try {
      const response =
        await getDestinations()

      setDestinations(response.items ?? [])
    } catch (error) {
      console.error(
        "Failed to load destinations:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load destinations"
      )
    } finally {
      setLoadingDestinations(false)
    }
  }

  async function loadAggregationRules() {
    setLoadingAggregationRules(true)

    try {
      const response =
        await getAggregationRules()

      setAggregationRules(
        response.items ?? []
      )
    } catch (error) {
      console.error(
        "Failed to load aggregation rules:",
        error
      )

      setAggregationRules([])

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load aggregation rules"
      )
    } finally {
      setLoadingAggregationRules(false)
    }
  }

  useEffect(() => {
    setShowAdd(false)
    setError(null)
    setTargets([])

    if (!route) {
      setAggregationEnabled(false)
      setAggregationRuleId(null)
      return
    }

    setAggregationEnabled(
      route.aggregationEnabled
    )

    setAggregationRuleId(
      route.aggregationRuleId
    )

    void loadTargets(route.id)
    void loadAggregationRules()
  }, [route?.id])

  const availableDestinations = useMemo(() => {
    const attachedIds = new Set(
      targets.map((target) => target.id)
    )

    return destinations.filter(
      (destination) =>
        destination.enabled &&
        !attachedIds.has(destination.id)
    )
  }, [destinations, targets])

  const availableAggregationRules =
    useMemo(() => {
      return aggregationRules.filter(
        (rule) => rule.enabled
      )
    }, [aggregationRules])

  async function openAddDestination() {
    setShowAdd((current) => !current)

    if (!showAdd) {
      await loadDestinations()
    }
  }

  async function handleAttach(
    targetId: string
  ) {
    if (!route) {
      return
    }

    setAttaching(targetId)
    setError(null)

    try {
      await attachTargetToRoute(
        route.id,
        targetId
      )

      await loadTargets(route.id)

      setShowAdd(false)
    } catch (error) {
      console.error(
        "Failed to attach destination:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "Failed to attach destination"
      )
    } finally {
      setAttaching(null)
    }
  }

  async function handleDetach(
    targetId: string
  ) {
    if (!route) {
      return
    }

    setDetaching(targetId)
    setError(null)

    try {
      await detachTargetFromRoute(
        route.id,
        targetId
      )

      await loadTargets(route.id)
    } catch (error) {
      console.error(
        "Failed to detach destination:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "Failed to detach destination"
      )
    } finally {
      setDetaching(null)
    }
  }

  async function handleAggregationChange(
    enabled: boolean
  ) {
    if (!route) {
      return
    }

    if (
      enabled &&
      !aggregationRuleId
    ) {
      setError(
        "Select an aggregation rule first"
      )
      return
    }

    setSavingAggregation(true)
    setError(null)

    try {
      const result =
        await updateRouteAggregation(
          route.id,
          enabled,
          enabled
            ? aggregationRuleId
            : null
        )

      setAggregationEnabled(
        result.aggregation_enabled
      )

      setAggregationRuleId(
        result.aggregation_rule_id
      )
    } catch (error) {
      console.error(
        "Failed to update aggregation:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update aggregation"
      )
    } finally {
      setSavingAggregation(false)
    }
  }

  async function copyEndpoint() {
    try {
      await navigator.clipboard.writeText(
        endpoint
      )

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 1600)
    } catch {
      setCopied(false)
    }
  }

  if (!route) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <div>
          <RouteIcon className="mx-auto h-8 w-8 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">
            Select a route
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Route details and webhook endpoint
            information will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Header */}

      <div className="border-b border-border p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/40">
            <RouteIcon className="h-4 w-4 text-orange-400" />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold">
              Route Inspector
            </h2>

            <p className="truncate text-xs text-muted-foreground">
              {route.path}
            </p>
          </div>
        </div>
      </div>

      {/* Endpoint */}

      <div className="border-b border-border p-5">
        <div className="mb-3 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-orange-400" />

          <h3 className="text-sm font-medium">
            Webhook Endpoint
          </h3>
        </div>

        <div className="rounded-xl border border-border bg-background/50 p-3">
          <p className="break-all font-mono text-xs leading-5 text-muted-foreground">
            {endpoint}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={copyEndpoint}
              className="
                inline-flex items-center gap-2
                rounded-lg border border-border
                px-3 py-2 text-xs font-medium
                transition-colors
                hover:bg-accent
              "
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy endpoint
                </>
              )}
            </button>

            <a
              href={`/events?route=${encodeURIComponent(
                route.path
              )}`}
              className="
                inline-flex items-center gap-2
                rounded-lg border border-border
                px-3 py-2 text-xs font-medium
                transition-colors
                hover:bg-accent
              "
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View events
            </a>
          </div>
        </div>

        <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
          Send webhook requests to this URL to
          route events through Hooktrace.
        </p>
      </div>

      {/* Route information */}

      <div className="space-y-4 border-b border-border p-5">
        <h3 className="text-sm font-medium">
          Route Details
        </h3>

        <Info
          label="Provider"
          value={route.provider}
        />

        <Info
          label="Mode"
          value={
            <span className="capitalize">
              {route.mode}
            </span>
          }
        />

        <Info
          label="Status"
          value={
            <Status status={route.status} />
          }
        />

        <Info
          label="Throughput"
          value={`${route.throughput}/m`}
        />

        <Info
          label="Failures"
          value={route.failures}
        />

        <Info
          label="Destinations"
          value={targets.length}
        />

        <Info
          label="Last seen"
          value={route.lastSeen ?? "Never"}
        />
      </div>

      {/* Aggregation */}

      <div className="border-b border-border p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Aggregation
          </h3>

          <span
            className={`
              rounded-full px-2 py-1
              text-[10px]
              ${
                aggregationEnabled
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }
            `}
          >
            {aggregationEnabled
              ? "Enabled"
              : "Disabled"}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="aggregation-rule"
              className="mb-1.5 block text-[11px] text-muted-foreground"
            >
              Aggregation rule
            </label>

            <select
              id="aggregation-rule"
              value={aggregationRuleId ?? ""}
              onChange={(event) =>
                setAggregationRuleId(
                  event.target.value || null
                )
              }
              disabled={
                loadingAggregationRules ||
                savingAggregation
              }
              className="
                w-full rounded-lg
                border border-border
                bg-background
                px-3 py-2
                text-xs
                outline-none
                transition-colors
                focus:border-orange-400/50
                disabled:opacity-50
              "
            >
              <option value="">
                {loadingAggregationRules
                  ? "Loading rules..."
                  : availableAggregationRules.length === 0
                    ? "No enabled rules available"
                    : "Select a rule"}
              </option>

              {availableAggregationRules.map(
                (rule) => (
                  <option
                    key={rule.id}
                    value={rule.id}
                  >
                    {rule.name}
                  </option>
                )
              )}
            </select>
          </div>

          {aggregationRuleId && (
            <div className="rounded-lg border border-border bg-background/30 p-3">
              {(() => {
                const rule =
                  aggregationRules.find(
                    (item) =>
                      item.id ===
                      aggregationRuleId
                  )

                if (!rule) {
                  return (
                    <p className="text-xs text-muted-foreground">
                      Selected rule is no longer
                      available.
                    </p>
                  )
                }

                return (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] text-muted-foreground">
                        Mode
                      </span>

                      <span className="text-xs capitalize">
                        {rule.config.mode}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-muted-foreground">
                        Batch size
                      </span>

                      <span className="text-xs">
                        {rule.config.maxBatchSize ??
                          "—"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-muted-foreground">
                        Timeout
                      </span>

                      <span className="text-xs">
                        {rule.config.timeoutMs
                          ? `${rule.config.timeoutMs}ms`
                          : "—"}
                      </span>
                    </div>
                  </>
                )
              })()}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              void handleAggregationChange(
                !aggregationEnabled
              )
            }
            disabled={
              savingAggregation ||
              (aggregationEnabled === false &&
                !aggregationRuleId)
            }
            className="
              inline-flex w-full
              items-center justify-center
              gap-2
              rounded-lg
              border border-border
              px-3 py-2
              text-xs font-medium
              transition-colors
              hover:bg-accent
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {savingAggregation ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : aggregationEnabled ? (
              "Disable aggregation"
            ) : (
              "Enable aggregation"
            )}
          </button>

          <p className="text-[11px] leading-4 text-muted-foreground">
            Aggregation batches matching webhook
            events before delivery.
          </p>
        </div>
      </div>

      {/* Delivery Targets */}

      <div className="border-b border-border p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Delivery Targets
          </h3>

          <button
            type="button"
            onClick={openAddDestination}
            className="
              inline-flex items-center gap-1.5
              rounded-lg border border-border
              px-2.5 py-1.5
              text-xs font-medium
              transition-colors
              hover:bg-accent
            "
          >
            {showAdd ? (
              <>
                <X className="h-3.5 w-3.5" />
                Close
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Add destination
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        {loadingTargets ? (
          <div className="flex items-center gap-2 rounded-lg border border-border p-3 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading targets...
          </div>
        ) : targets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">
              No destinations attached to this route.
            </p>

            <p className="mt-1 text-[11px] text-muted-foreground/70">
              Attach a destination to start delivering
              webhook events.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {targets.map((target) => (
              <div
                key={target.id}
                className="rounded-lg border border-border bg-background/30 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {target.name}
                    </p>

                    <p className="mt-1 text-[11px] capitalize text-muted-foreground">
                      {target.type}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void handleDetach(
                        target.id
                      )
                    }
                    disabled={
                      detaching === target.id
                    }
                    className="
                      shrink-0 rounded-md p-1.5
                      text-muted-foreground
                      transition-colors
                      hover:bg-rose-500/10
                      hover:text-rose-400
                      disabled:opacity-50
                    "
                    title="Detach destination"
                  >
                    {detaching === target.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`
                      rounded-full px-2 py-1
                      text-[10px]
                      ${
                        target.enabled &&
                        target.route_enabled
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }
                    `}
                  >
                    {target.enabled &&
                    target.route_enabled
                      ? "Enabled"
                      : "Disabled"}
                  </span>

                  <span className="text-[10px] text-muted-foreground">
                    {target.providers.length
                      ? target.providers.join(
                          ", "
                        )
                      : "All providers"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAdd && (
          <div className="mt-3 rounded-xl border border-border bg-background/40 p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium">
                Available destinations
              </p>

              {loadingDestinations && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </div>

            {loadingDestinations ? (
              <p className="text-xs text-muted-foreground">
                Loading destinations...
              </p>
            ) : availableDestinations.length ===
              0 ? (
              <p className="text-xs text-muted-foreground">
                No available destinations.
              </p>
            ) : (
              <div className="space-y-2">
                {availableDestinations.map(
                  (destination) => (
                    <button
                      key={destination.id}
                      type="button"
                      onClick={() =>
                        void handleAttach(
                          destination.id
                        )
                      }
                      disabled={
                        attaching ===
                        destination.id
                      }
                      className="
                        flex w-full items-center
                        justify-between gap-3
                        rounded-lg border
                        border-border
                        p-3 text-left
                        transition-colors
                        hover:bg-accent
                        disabled:opacity-50
                      "
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {destination.name}
                        </p>

                        <p className="mt-1 text-[11px] capitalize text-muted-foreground">
                          {destination.type}
                        </p>
                      </div>

                      {attaching ===
                      destination.id ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 rotate-[-90deg] text-muted-foreground" />
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Credentials */}

      <div className="p-5">
        <h3 className="mb-4 text-sm font-medium">
          Endpoint Credentials
        </h3>

        <div className="rounded-xl border border-border bg-background/40 p-3">
          <p className="text-[11px] text-muted-foreground">
            Endpoint token
          </p>

          <p className="mt-1 break-all font-mono text-xs">
            {route.token}
          </p>
        </div>

        {route.secret && (
          <div className="mt-2 rounded-xl border border-border bg-background/40 p-3">
            <p className="text-[11px] text-muted-foreground">
              Signing secret
            </p>

            <p className="mt-1 break-all font-mono text-xs">
              {route.secret}
            </p>
          </div>
        )}
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
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="text-right">
        {value}
      </span>
    </div>
  )
}

function Status({
  status,
}: {
  status: Route["status"]
}) {
  const styles = {
    active:
      "bg-emerald-500/10 text-emerald-400",
    paused:
      "bg-amber-500/10 text-amber-400",
    error:
      "bg-rose-500/10 text-rose-400",
  }

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs capitalize ${styles[status]}`}
    >
      {status}
    </span>
  )
}