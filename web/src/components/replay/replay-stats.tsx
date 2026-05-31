"use client"

const stats = [
  {
    label: "Queued",
    value: "42",
  },
  {
    label: "Running",
    value: "8",
  },
  {
    label: "Completed",
    value: "612",
  },
  {
    label: "Failed",
    value: "13",
  },
]

export function ReplayStats() {
  return (
    <div className="grid grid-cols-4 border-b border-border">

      {stats.map((item) => (
        <div
          key={item.label}
          className="
            border-r border-border
            px-5 py-4 last:border-r-0
          "
        >
          <p className="text-xs text-muted-foreground">
            {item.label}
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {item.value}
          </p>
        </div>
      ))}

    </div>
  )
}