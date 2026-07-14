"use client"

import { Cable, Plus } from "lucide-react"

type Props = {
  onCreate: () => void
}

export function TunnelEmpty({
  onCreate,
}: Props) {
  return (
    <div
      className="
        flex
        flex-1
        items-center
        justify-center
        p-12
      "
    >
      <div className="max-w-md text-center">

        <div
          className="
            mx-auto
            mb-6
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-2xl
            border
            border-orange-500/20
            bg-orange-500/10
          "
        >
          <Cable className="h-10 w-10 text-orange-400" />
        </div>

        <h2 className="text-2xl font-semibold">
          No tunnels yet
        </h2>

        <p className="mt-3 text-sm text-muted-foreground">
          Create a development tunnel to receive webhooks on
          your local machine.
        </p>

        <button
          onClick={onCreate}
          className="
            mt-8
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-orange-500
            px-5
            py-3
            text-sm
            font-medium
            text-white
            transition-all
            hover:bg-orange-600
          "
        >
          <Plus className="h-4 w-4" />

          Create Tunnel
        </button>
      </div>
    </div>
  )
}