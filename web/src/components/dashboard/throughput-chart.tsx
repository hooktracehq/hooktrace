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

const data = [
  { time: "12:00", value: 120 },
  { time: "12:05", value: 220 },
  { time: "12:10", value: 180 },
  { time: "12:15", value: 310 },
  { time: "12:20", value: 260 },
]

export function ThroughputChart() {
  return (
    <div
      className="
        col-span-12 xl:col-span-8
        rounded-2xl border border-border
        bg-surface-1
        p-6
      "
    >

      <div className="mb-6">

        <h2 className="text-xl font-semibold">
          Event Throughput
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          realtime webhook traffic
        </p>

      </div>

      <div className="h-[420px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <AreaChart data={data}>

            <defs>

              <linearGradient
                id="throughput"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor="#f97316"
                  stopOpacity={0.45}
                />

                <stop
                  offset="100%"
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
              stroke="#71717a"
            />

            <YAxis
              stroke="#71717a"
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#f97316"
              fill="url(#throughput)"
              strokeWidth={2}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>
    </div>
  )
}