"use client"

type ReplayStatsData = {
  queued: number
  running: number
  completed: number
  failed: number
}

type Props = {
  stats: ReplayStatsData
}

export function ReplayStats({ stats }: Props) {
  const items = [
    {
      label: "Queued",
      value: stats.queued,
    },
    {
      label: "Running",
      value: stats.running,
    },
    {
      label: "Completed",
      value: stats.completed,
    },
    {
      label: "Failed",
      value: stats.failed,
    },
  ]

  return (
    <div className="grid grid-cols-4 border-b border-border">
      {items.map((item) => (
        <div
          key={item.label}
          className="
            border-r border-border
            px-5 py-4
            last:border-r-0
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