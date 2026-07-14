"use client"

import {
  CheckCircle2,
  PauseCircle,
  XCircle,
} from "lucide-react"

import type { Tunnel } from "@/types/tunnel"

type Props = {
  status: Tunnel["status"]
}

export function TunnelStatusBadge({
  status,
}: Props) {
  const variants = {
    active: {
      label: "Active",
      icon: CheckCircle2,
      className:
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },

    paused: {
      label: "Paused",
      icon: PauseCircle,
      className:
        "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    },

    offline: {
      label: "Offline",
      icon: XCircle,
      className:
        "bg-red-500/10 text-red-400 border border-red-500/20",
    },
  }

  const variant =
    variants[status] ??
    variants.offline

  const Icon = variant.icon

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-3
        py-1
        text-xs
        font-medium
        ${variant.className}
      `}
    >
      <Icon className="h-3.5 w-3.5" />

      {variant.label}
    </span>
  )
}