"use client"

import {
  Pause,
  Play,
  Search,
  Wifi,
} from "lucide-react"

type Props = {
  paused: boolean
  setPaused: (v: boolean) => void

  query: string
  setQuery: (v: string) => void

  provider: string
  setProvider: (v: string) => void

  statusFilter: string
  setStatusFilter: (v: string) => void

  eventType: string
  setEventType: (v: string) => void

  connectionStatus:
    | "connecting"
    | "connected"
    | "disconnected"
}

export function StreamToolbar({
  paused,
  setPaused,
  query,
  setQuery,
  provider,
  setProvider,
  statusFilter,
  setStatusFilter,
  eventType,
  setEventType,
  connectionStatus,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">

      {/* Left */}

      <div className="flex items-center gap-3">

        <div className="flex items-center gap-2">

          <div
            className="
              h-2 w-2
              animate-pulse
              rounded-full
              bg-emerald-500
            "
          />

          <h1 className="text-lg font-semibold">
            Live Streams
          </h1>

        </div>

        <span className="text-xs text-muted-foreground">
          realtime ingress traffic
        </span>

      </div>

      {/* Right */}

      <div className="flex items-center gap-3">

        {/* Search */}

        <div
          className="
            flex items-center gap-2
            rounded-xl
            border border-border
            bg-background/30
            px-3 py-2
          "
        >
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search..."
            className="
              w-44
              bg-transparent
              text-sm
              outline-none
              placeholder:text-muted-foreground
            "
          />

        </div>

        {/* Provider */}

        <select
          value={provider}
          onChange={(e) =>
            setProvider(e.target.value)
          }
          className="
            rounded-xl
            border border-border
            bg-background/30
            px-3 py-2
            text-sm
          "
        >
          <option value="">
            All Providers
          </option>

          <option value="stripe">
            Stripe
          </option>

          <option value="github">
            GitHub
          </option>

          <option value="slack">
            Slack
          </option>

          <option value="shopify">
            Shopify
          </option>

        </select>

        {/* Status */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="
            rounded-xl
            border border-border
            bg-background/30
            px-3 py-2
            text-sm
          "
        >
          <option value="">
            All Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="processing">
            Processing
          </option>

          <option value="retrying">
            Retrying
          </option>

          <option value="delivered">
            Delivered
          </option>

          <option value="failed">
            Failed
          </option>

          <option value="dlq">
            DLQ
          </option>

        </select>

        {/* Event Type */}

        <select
          value={eventType}
          onChange={(e) =>
            setEventType(e.target.value)
          }
          className="
            rounded-xl
            border border-border
            bg-background/30
            px-3 py-2
            text-sm
          "
        >
          <option value="">
            All Events
          </option>

          <option value="payment.succeeded">
            payment.succeeded
          </option>

          <option value="payment.failed">
            payment.failed
          </option>

          <option value="push">
            push
          </option>

          <option value="checkout.completed">
            checkout.completed
          </option>

        </select>

        {/* Pause */}

        <button
          onClick={() =>
            setPaused(!paused)
          }
          className="
            flex items-center gap-2
            rounded-xl
            border border-border
            bg-background/20
            px-4 py-2
            text-sm
            transition-colors
            hover:bg-white/[0.03]
          "
        >
          {paused ? (
            <>
              <Play className="h-4 w-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          )}
        </button>

        {/* Connection */}

        <div
          className={`
            flex items-center gap-2
            rounded-xl
            border
            px-3 py-2
            text-sm

            ${
              connectionStatus === "connected"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"

                : connectionStatus === "connecting"

                ? "border-amber-500/20 bg-amber-500/10 text-amber-400"

                : "border-rose-500/20 bg-rose-500/10 text-rose-400"
            }
          `}
        >
          <Wifi className="h-4 w-4" />

          {connectionStatus === "connected" &&
            "Connected"}

          {connectionStatus === "connecting" &&
            "Connecting"}

          {connectionStatus === "disconnected" &&
            "Disconnected"}

        </div>

      </div>

    </div>
  )
}