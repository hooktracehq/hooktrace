"use client"

type Props = {
  connectionStatus: string
  buffered: number
}

export function StreamStatusbar({
  connectionStatus,
  buffered,
}: Props) {
  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">

      <div className="flex items-center gap-4">
        <span>/ws/events</span>
        <span>{buffered} events</span>
      </div>

      <div className="flex items-center gap-2">

        <div
          className={`h-2 w-2 rounded-full ${
            connectionStatus === "connected"
              ? "bg-emerald-500"
              : connectionStatus === "connecting"
              ? "bg-amber-500"
              : "bg-rose-500"
          }`}
        />

        {connectionStatus}
      </div>

    </div>
  )
}