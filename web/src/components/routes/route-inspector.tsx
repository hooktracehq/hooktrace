"use client"

import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Route as RouteIcon,
} from "lucide-react"

import { useState } from "react"

import { Route } from "@/types/route"

type Props = {
  route: Route | null
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"

export function RouteInspector({
  route,
}: Props) {
  const [copied, setCopied] =
    useState(false)

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

  const endpoint =
    `${API_URL}/r/${route.token}/${route.path}`

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
          value={route.destinations}
        />

        <Info
          label="Last seen"
          value={route.lastSeen ?? "Never"}
        />
      </div>

      {/* Targets */}

      <div className="border-b border-border p-5">
        <h3 className="mb-4 text-sm font-medium">
          Delivery Targets
        </h3>

        <div className="space-y-2">
          <Target
            label="Development"
            value={route.devTarget}
          />

          <Target
            label="Production"
            value={route.prodTarget}
          />
        </div>
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

function Target({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="rounded-lg border border-border bg-background/30 p-3">
      <p className="text-[11px] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate text-sm">
        {value || "Not configured"}
      </p>
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