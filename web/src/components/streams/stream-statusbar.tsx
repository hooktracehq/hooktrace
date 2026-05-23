"use client"

export function StreamStatusbar() {
  return (
    <div
      className="
        flex items-center justify-between
        border-t border-border
        px-5 py-3 text-xs
        text-muted-foreground
      "
    >

      <div className="flex items-center gap-4">

        <span>
          ws://localhost:3001
        </span>

        <span>
          124 buffered
        </span>

      </div>

      <div className="flex items-center gap-2">

        <div className="h-2 w-2 rounded-full bg-emerald-500" />

        Connected

      </div>

    </div>
  )
}