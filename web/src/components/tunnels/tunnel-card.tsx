"use client"

import Link from "next/link"

import {
  Copy,
  ExternalLink,
} from "lucide-react"

import type { Tunnel } from "@/types/tunnel"

type Props = {
  tunnel: Tunnel
}

export function TunnelCard({
  tunnel,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">

      <div className="mb-4 flex items-center justify-between">

        <div>

          <h3 className="font-semibold">
            {tunnel.name}
          </h3>

          <p className="text-sm text-muted-foreground">
            {tunnel.publicUrl}
          </p>

        </div>

        <span
          className="
            rounded-full
            bg-emerald-500/10
            px-2 py-1
            text-xs text-emerald-400
          "
        >
          {tunnel.status}
        </span>

      </div>

      <div className="space-y-2 text-sm">

        <div>
          Forwarding →
          {tunnel.targetUrl}
        </div>

        <div>
          Requests →
          {tunnel.requestCount}
        </div>

      </div>

      <div className="mt-5 flex gap-2">

        <button className="rounded-lg border border-border p-2">
          <Copy className="h-4 w-4" />
        </button>

        <Link
          href={`/tunnels/${tunnel.id}/logs`}
          className="rounded-lg border border-border p-2"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>

      </div>

    </div>
  )
}