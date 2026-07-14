"use client"

import { useState } from "react"

import { CreateTunnelModal } from "./create-tunnel-modal"
import { TunnelCard } from "./tunnel-card"
import { TunnelEmpty } from "./tunnel-empty"
import { TunnelsStats } from "./tunnels-stats"
import { TunnelsToolbar } from "./tunnels-toolbar"

import { useTunnels } from "@/hooks/tunnels/use-tunnels"
import { useTunnelRealtime } from "@/hooks/tunnels/use-tunnel-realtime"

export function TunnelsWorkspace() {
  const [showModal, setShowModal] =
    useState(false)

  const {
    data: tunnels = [],
    isLoading,
  } = useTunnels()

  useTunnelRealtime()

  return (
    <div
      className="
        flex
        h-[calc(100vh-92px)]
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-surface-1
      "
    >
      <TunnelsToolbar
        total={tunnels.length}
        onCreate={() =>
          setShowModal(true)
        }
      />

      <TunnelsStats
        tunnels={tunnels}
      />

      <div className="flex-1 overflow-auto p-6">

        {isLoading ? (

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  h-72
                  animate-pulse
                  rounded-2xl
                  border
                  border-border
                  bg-muted/40
                "
              />
            ))}

          </div>

        ) : tunnels.length === 0 ? (

          <div className="flex h-full items-center justify-center">

            <TunnelEmpty
              onCreate={() =>
                setShowModal(true)
              }
            />

          </div>

        ) : (

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {tunnels.map((tunnel) => (

              <TunnelCard
                key={tunnel.id}
                tunnel={tunnel}
              />

            ))}

          </div>

        )}

      </div>

      {showModal && (

        <CreateTunnelModal
          onClose={() =>
            setShowModal(false)
          }
        />

      )}

    </div>
  )
}