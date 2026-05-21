"use client"

const rows = 7
const cols = 12

const levels = [
  "bg-white/[0.03]",
  "bg-orange-500/20",
  "bg-orange-500/40",
  "bg-orange-500/70",
]

export function EventHeatmap() {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-6">

      <div className="mb-6">

        <h2 className="text-lg font-semibold">
          Event Heatmap
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          webhook traffic intensity
        </p>

      </div>

      <div className="grid grid-cols-12 gap-2">

        {Array.from({
          length: rows * cols,
        }).map((_, index) => {

          const level =
            Math.floor(
              Math.random() * levels.length
            )

          return (
            <div
              key={index}
              className={`
                aspect-square rounded-md border border-border
                transition-all hover:scale-110
                ${levels[level]}
              `}
            />
          )
        })}

      </div>

    </div>
  )
}