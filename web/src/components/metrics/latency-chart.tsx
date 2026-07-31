"use client"

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

type Props = {
  data: {
    time: string
    latency: number
  }[]
}

export function LatencyChart({
  data,
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Delivery Latency
        </h2>

        <p className="text-sm text-muted-foreground">
          Average delivery latency
        </p>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />

            <XAxis
              dataKey="time"
              stroke="#737373"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#737373"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                `${Number(value).toFixed(2)}s`
              }
            />

            <Tooltip
              formatter={(value) => [
                `${Number(value ?? 0).toFixed(3)} s`,
                "Latency",
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgb(38 38 38)",
                background: "#09090b",
                color: "#fff",
              }}
              cursor={{
                stroke: "#38bdf8",
                strokeDasharray: "4 4",
              }}
            />

            <Line
              type="monotone"
              dataKey="latency"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                fill: "#38bdf8",
                strokeWidth: 2,
                stroke: "#fff",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}