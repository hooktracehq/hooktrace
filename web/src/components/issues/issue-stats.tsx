"use client"

const stats = [
  {
    label: "Failures",
    value: "142",
  },

  {
    label: "DLQ Size",
    value: "28",
  },

  {
    label: "Retrying",
    value: "19",
  },

  {
    label: "Recovery Rate",
    value: "94%",
  },
]

export function IssueStats() {
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