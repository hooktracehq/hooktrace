"use client"

import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { Connection } from "@/types/connection"

type Props = {
  connection: Connection
  selected?: boolean
  onClick?: () => void
}

export function ConnectionCard({
  connection,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
          rounded-2xl
          border border-border
          bg-background/40
          p-5
          text-left
          transition-all
          hover:border-orange-500/30
        `,
        selected &&
          "border-orange-500/50 bg-orange-500/[0.03]"
      )}
    >
      <div className="mb-5 flex items-center justify-between">

        <h3 className="text-lg font-semibold">
          {connection.provider}
        </h3>

        {connection.status ===
        "healthy" ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-rose-400" />
        )}

      </div>

      <div className="space-y-3 text-sm">

        <Info
          label="Account"
          value={
            connection.accountName
          }
        />

        <Info
          label="Last Sync"
          value={
            connection.lastSync
          }
        />

        <Info
          label="API Version"
          value={
            connection.apiVersion
          }
        />

      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">

        <span className="text-xs text-muted-foreground">
          Connected
          {" "}
          {connection.connectedAt}
        </span>

        <ExternalLink className="h-4 w-4 text-muted-foreground" />

      </div>
    </button>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span>{value}</span>
    </div>
  )
}