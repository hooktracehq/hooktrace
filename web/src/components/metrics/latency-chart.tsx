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
          average delivery timing
        </p>
      </div>

      <div className="h-[320px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart
            data={data}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />

            <XAxis
              dataKey="time"
              stroke="#737373"
            />

            <YAxis
              stroke="#737373"
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="latency"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>
    </div>
  )
}