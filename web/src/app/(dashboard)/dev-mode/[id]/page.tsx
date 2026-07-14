"use client"

import { useParams } from "next/navigation"

import { TunnelCli } from "@/components/tunnels/tunnel-cli"
import { TunnelHeader } from "@/components/tunnels/tunnel-header"
import { TunnelOverview } from "@/components/tunnels/tunnel-overview"
import { TunnelRequestTable } from "@/components/tunnels/tunnel-request-table"

import { useTunnel } from "@/hooks/tunnels/use-tunnel"
import { useTunnelLogs } from "@/hooks/tunnels/use-tunnel-logs"
import { useTunnelRealtime } from "@/hooks/tunnels/use-tunnel-realtime"
import { useTunnelStats } from "@/hooks/tunnels/use-tunnel-stats"

export default function TunnelPage() {
  const params = useParams()

  const tunnelId = params.id as string

  useTunnelRealtime(tunnelId)

  const {
    data: tunnel,
    isLoading: tunnelLoading,
    isError,
  } = useTunnel({
    id: tunnelId,
  })

  const {
    data: logs = [],
    isLoading: logsLoading,
  } = useTunnelLogs(tunnelId)

  const {
    data: stats,
    isLoading: statsLoading,
  } = useTunnelStats(tunnelId)

  if (tunnelLoading || statsLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading tunnel...
        </div>
      </div>
    )
  }

  if (isError || !tunnel) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">

          <h2 className="text-lg font-semibold">
            Tunnel not found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            The requested tunnel doesn&apos;t exist or has been deleted.
          </p>

        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading statistics...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">

      <TunnelHeader
        tunnel={tunnel}
      />

      <TunnelOverview
        tunnel={tunnel}
        stats={stats}
      />

      <TunnelCli
        token={tunnel.token}
      />

      <TunnelRequestTable
        logs={logs}
        loading={logsLoading}
      />

    </div>
  )
}