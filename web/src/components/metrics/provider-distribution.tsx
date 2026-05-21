"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

type Props = {
  data: {
    name: string
    value: number
  }[]
}

const COLORS = [
  "#f97316",
  "#22c55e",
  "#3b82f6",
  "#e11d48",
  "#a855f7",
]

export function ProviderDistribution({
  data,
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-5">

      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Provider Distribution
        </h2>

        <p className="text-sm text-muted-foreground">
          traffic source breakdown
        </p>
      </div>

      <div className="h-[320px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
            >

              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={
                    COLORS[
                      index % COLORS.length
                    ]
                  }
                />
              ))}

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>
    </div>
  )
}