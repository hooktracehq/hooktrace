"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Props = {
  data: {
    time: string
    events: number
  }[]
}

export function MetricsChart({
  data,
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-5">

      <div className="mb-6">

        <h2 className="text-lg font-semibold">
          Event Throughput
        </h2>

        <p className="text-sm text-muted-foreground">
          realtime webhook traffic
        </p>

      </div>

      <div className="h-[320px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <AreaChart
            data={data}
          >

            <defs>
              <linearGradient
                id="colorEvents"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#f97316"
                  stopOpacity={0.4}
                />

                <stop
                  offset="95%"
                  stopColor="#f97316"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />

            <XAxis
              dataKey="time"
              stroke="#737373"
            />

            <YAxis
              stroke="#737373"
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="events"
              stroke="#f97316"
              fillOpacity={1}
              fill="url(#colorEvents)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>
  )
}