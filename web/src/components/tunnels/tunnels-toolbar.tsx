"use client"

import { Cable, Plus } from "lucide-react"

type Props = {
  onCreate: () => void
}

export function TunnelsToolbar({
  onCreate,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">

      <div className="flex items-center gap-3">

        <Cable className="h-5 w-5 text-orange-400" />

        <div>

          <h2 className="text-xl font-semibold">
            Tunnels
          </h2>

          <p className="text-sm text-muted-foreground">
            forward webhooks to localhost
          </p>

        </div>

      </div>

      <button
        onClick={onCreate}
        className="
          flex items-center gap-2
          rounded-lg
          bg-orange-500
          px-4 py-2
          text-sm font-medium
          text-white
        "
      >
        <Plus className="h-4 w-4" />
        Create Tunnel
      </button>

    </div>
  )
}