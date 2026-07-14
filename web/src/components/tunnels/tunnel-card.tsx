"use client"

import Link from "next/link"

import {
  ArrowUpRight,
  Activity,
  Clock3,
  ExternalLink,
} from "lucide-react"

import {
  Tunnel,
} from "@/types/tunnel"

import { TunnelCopy } from "./tunnel-copy"
import { TunnelCli } from "./tunnel-cli"
import { TunnelStatusBadge } from "./tunnel-status-badge"

type Props = {
  tunnel: Tunnel
}

export function TunnelCard({
  tunnel,
}: Props) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-border
        bg-card
        p-6
        transition-all
        hover:border-orange-500/30
      "
    >
      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h3 className="text-lg font-semibold">
            {tunnel.name}
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Created{" "}
            {new Date(
              tunnel.createdAt,
            ).toLocaleDateString()}
          </p>

        </div>

        <TunnelStatusBadge
          status={tunnel.status}
        />

      </div>

      {/* Public URL */}

      <div className="mt-6">

        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          Public URL
        </p>

        <div
          className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
          "
        >
          <span
            className="
              truncate
              text-sm
              font-mono
            "
          >
            {tunnel.publicUrl}
          </span>

          <TunnelCopy
            value={tunnel.publicUrl}
          />

        </div>

      </div>

      {/* Local */}

      <div className="mt-5">

        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          Forwarding To
        </p>

        <div
          className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
            text-sm
          "
        >
          <ArrowUpRight className="h-4 w-4 text-orange-400" />

          <span className="font-mono">
            {tunnel.localUrl}
          </span>

        </div>

      </div>

      {/* Stats */}

      <div className="mt-6 grid grid-cols-2 gap-4">

        <div
          className="
            rounded-xl
            border
            border-border
            bg-background
            p-4
          "
        >
          <div className="flex items-center gap-2 text-muted-foreground">

            <Activity className="h-4 w-4" />

            Requests

          </div>

          <div className="mt-2 text-2xl font-semibold">
            {tunnel.requestCount}
          </div>

        </div>

        <div
          className="
            rounded-xl
            border
            border-border
            bg-background
            p-4
          "
        >
          <div className="flex items-center gap-2 text-muted-foreground">

            <Clock3 className="h-4 w-4" />

            Last Used

          </div>

          <div className="mt-2 text-sm font-medium">
            {tunnel.lastUsed
              ? new Date(
                  tunnel.lastUsed,
                ).toLocaleString()
              : "Never"}
          </div>

        </div>

      </div>

      {/* CLI */}

      <TunnelCli
        token={tunnel.token}
      />

      {/* Footer */}

      <div className="mt-6 flex items-center justify-end">

        <Link
          href={`/dev-mode/${tunnel.id}`}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-border
            px-4
            py-2
            text-sm
            transition-colors
            hover:bg-accent
          "
        >
          View Details

          <ExternalLink className="h-4 w-4" />
        </Link>

      </div>

    </div>
  )
}