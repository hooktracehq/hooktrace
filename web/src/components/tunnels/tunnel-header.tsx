"use client"

import Link from "next/link"

import {
  ArrowLeft,
  Cable,
  Globe,
} from "lucide-react"

import { TunnelActions } from "./tunnel-actions"
import { TunnelCopy } from "./tunnel-copy"
import { TunnelStatusBadge } from "./tunnel-status-badge"

import type { Tunnel } from "@/types/tunnel"

type Props = {
  tunnel: Tunnel
}

export function TunnelHeader({
  tunnel,
}: Props) {
  return (
    <header
      className="
        rounded-2xl
        border
        border-border
        bg-card
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-border
          px-6
          py-4
        "
      >
        <div className="flex items-center gap-3">

          <Link
            href="/dev-mode"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              border
              border-border
              transition-colors
              hover:bg-accent
            "
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-orange-500/10
              text-orange-400
            "
          >
            <Cable className="h-6 w-6" />
          </div>

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-2xl font-semibold">
                {tunnel.name}
              </h1>

              <TunnelStatusBadge
                status={tunnel.status}
              />

            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Tunnel ID • {tunnel.id}
            </p>

          </div>

        </div>

        <TunnelActions
          tunnel={tunnel}
        />

      </div>

      <div
        className="
          grid
          gap-6
          px-6
          py-6
          lg:grid-cols-2
        "
      >
        <div className="space-y-5">

          <div>

            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Public Endpoint
            </div>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-border
                bg-background
                px-4
                py-3
              "
            >
              <Globe className="h-4 w-4 text-orange-400" />

              <code className="flex-1 overflow-hidden truncate text-sm">
                {tunnel.publicUrl}
              </code>

              <TunnelCopy
                value={tunnel.publicUrl}
              />

            </div>

          </div>

          <div>

            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Local Endpoint
            </div>

            <div
              className="
                rounded-xl
                border
                border-border
                bg-background
                px-4
                py-3
              "
            >
              <code className="text-sm">
                {tunnel.localUrl}
              </code>
            </div>

          </div>

        </div>

        <div className="space-y-5">

          <div>

            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tunnel Token
            </div>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-border
                bg-background
                px-4
                py-3
              "
            >
              <code className="flex-1 overflow-hidden truncate text-sm">
                {tunnel.token}
              </code>

              <TunnelCopy
                value={tunnel.token}
              />

            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div
              className="
                rounded-xl
                border
                border-border
                bg-background
                p-4
              "
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Created
              </div>

              <div className="mt-2 text-sm font-medium">
                {new Date(
                  tunnel.createdAt,
                ).toLocaleString()}
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Last Activity
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

        </div>

      </div>

    </header>
  )
}