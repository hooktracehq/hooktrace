"use client"

import {
  Cable,
  Plus,
  Radio,
} from "lucide-react"

type Props = {
  total: number
  onCreate: () => void
}

export function TunnelsToolbar({
  total,
  onCreate,
}: Props) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        border-b
        border-border
        px-6
        py-5
      "
    >
      <div className="flex items-center gap-4">

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
              Dev Tunnels
            </h1>

            <div
              className="
                flex
                items-center
                gap-1.5
                rounded-full
                border
                border-emerald-500/20
                bg-emerald-500/10
                px-2.5
                py-1
                text-xs
                font-medium
                text-emerald-400
              "
            >
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              Live
            </div>

          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Forward incoming webhooks securely to your local development
            environment.
          </p>

          <div className="mt-2 text-xs text-muted-foreground">
            {total} tunnel{total !== 1 ? "s" : ""} configured
          </div>

        </div>

      </div>

      <button
        onClick={onCreate}
        className="
          flex
          items-center
          gap-2
          rounded-lg
          bg-orange-500
          px-4
          py-2
          text-sm
          font-medium
          text-white
          transition-all
          hover:bg-orange-600
          hover:shadow-lg
          hover:shadow-orange-500/20
        "
      >
        <Plus className="h-4 w-4" />
        Create Tunnel
      </button>

    </div>
  )
}