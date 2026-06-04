"use client"

import { useState } from "react"

import { TunnelCard } from "./tunnel-card"
import { TunnelsStats } from "./tunnels-stats"
import { TunnelsToolbar } from "./tunnels-toolbar"
import { CreateTunnelModal } from "./create-tunnel-modal"

import type { Tunnel } from "@/types/tunnel"

const MOCK_TUNNELS: Tunnel[] = [
  {
    id: "1",
    name: "Local API",
    publicUrl:
      "https://hooktrace.dev/t/abc123",

    targetUrl:
      "http://localhost:3000",

    status: "active",

    requestCount: 1284,

    bytesTransferred: 1024,

    avgResponseTime: 100,

    createdAt:
      "2026-01-01",

    lastSeen:
      "2s ago",
  },
]

export function TunnelsWorkspace() {
  const [showModal, setShowModal] =
    useState(false)

  return (
    <div
      className="
        flex h-[calc(100vh-92px)]
        flex-col overflow-hidden
        rounded-2xl border border-border
        bg-surface-1
      "
    >

      <TunnelsToolbar
        onCreate={() =>
          setShowModal(true)
        }
      />

      <TunnelsStats
        tunnels={MOCK_TUNNELS}
      />

      <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">

        {MOCK_TUNNELS.map(
          (tunnel) => (
            <TunnelCard
              key={tunnel.id}
              tunnel={tunnel}
            />
          )
        )}

      </div>

      {showModal && (
        <CreateTunnelModal
          onClose={() =>
            setShowModal(false)
          }
          onCreate={() =>
            setShowModal(false)
          }
        />
      )}

    </div>
  )
}