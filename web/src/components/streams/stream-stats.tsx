"use client"

const stats = [
  {
    label: "Events/sec",
    value: "124/s",
  },

  {
    label: "Buffered",
    value: "18",
  },

  {
    label: "Connections",
    value: "42",
  },

  {
    label: "Throughput",
    value: "8.4MB/s",
  },
]

export function StreamStats() {
  return (
    <div className="grid grid-cols-4 border-b border-border">

      {stats.map((stat) => (
        <div
          key={stat.label}
          className="
            border-r border-border
            px-5 py-4 last:border-r-0
          "
        >

          <p className="text-xs text-muted-foreground">
            {stat.label}
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {stat.value}
          </p>

        </div>
      ))}

    </div>
  )
}