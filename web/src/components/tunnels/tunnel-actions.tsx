"use client"

import { useState } from "react"

import {
  Loader2,
  Pause,
  Play,
  Trash2,
} from "lucide-react"

import { useRouter } from "next/navigation"

import { useDeleteTunnel } from "@/hooks/tunnels/use-delete-tunnel"
import { useUpdateTunnel } from "@/hooks/tunnels/use-update-tunnel"

import type { Tunnel } from "@/types/tunnel"

type Props = {
  tunnel: Tunnel
}

export function TunnelActions({
  tunnel,
}: Props) {
  const router = useRouter()

  const [loading, setLoading] =
    useState(false)

  const updateTunnel =
    useUpdateTunnel()

  const deleteTunnel =
    useDeleteTunnel()

  async function handleToggle() {
    try {
      setLoading(true)

      await updateTunnel.mutateAsync({
        id: tunnel.id,
        payload: {
          status:
            tunnel.status === "paused"
              ? "active"
              : "paused",
        },
      })
    } catch (err) {
      console.error(err)

      alert(
        "Unable to update tunnel.",
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        `Delete "${tunnel.name}"?`,
      )

    if (!confirmed) return

    try {
      setLoading(true)

      await deleteTunnel.mutateAsync(
        tunnel.id,
      )

      router.push("/dev-mode")
    } catch (err) {
      console.error(err)

      alert(
        "Unable to delete tunnel.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">

      <button
        onClick={handleToggle}
        disabled={loading}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-border
          bg-background
          px-4
          py-2
          text-sm
          transition-colors
          hover:bg-accent
          disabled:opacity-50
        "
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : tunnel.status ===
          "paused" ? (
          <Play className="h-4 w-4 text-emerald-400" />
        ) : (
          <Pause className="h-4 w-4 text-yellow-400" />
        )}

        {tunnel.status ===
        "paused"
          ? "Resume"
          : "Pause"}
      </button>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-red-500/20
          bg-red-500/10
          px-4
          py-2
          text-sm
          text-red-400
          transition-colors
          hover:bg-red-500/20
          disabled:opacity-50
        "
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}

        Delete
      </button>

    </div>
  )
}