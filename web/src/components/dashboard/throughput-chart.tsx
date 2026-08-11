// "use client"

// import {
//   Area,
//   AreaChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts"

// import { Activity } from "lucide-react"

// export type ActivityPoint = {
//   timestamp: number
//   success: number
//   failure: number
// }

// type Props = {
//   activity?: ActivityPoint[] | null
// }

// export function ThroughputChart({
//   activity = [],
// }: Props) {
//   const safeActivity = Array.isArray(activity)
//     ? activity
//     : []

//   const chartData = safeActivity.map((item) => ({
//     timestamp: item.timestamp,

//     time: new Date(
//       Number(item.timestamp) * 1000
//     ).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     }),

//     success: Number(item.success) || 0,
//     failure: Number(item.failure) || 0,
//   }))

//   const delivered = chartData.reduce(
//     (sum, item) => sum + item.success,
//     0
//   )

//   const failed = chartData.reduce(
//     (sum, item) => sum + item.failure,
//     0
//   )

//   const total = delivered + failed

//   const successRate =
//     total > 0
//       ? (delivered / total) * 100
//       : 100

//   return (
//     <div className="rounded-2xl border border-border bg-surface-1 p-6">
//       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
//         <div>
//           <div className="flex items-center gap-2">
//             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
//               <Activity className="h-4 w-4 text-orange-400" />
//             </div>

//             <div>
//               <h2 className="text-sm font-semibold">
//                 Event Throughput
//               </h2>

//               <p className="mt-0.5 text-xs text-muted-foreground">
//                 Webhook traffic over the last 24 hours
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-5">
//           <div className="text-right">
//             <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
//               Events
//             </p>

//             <p className="mt-0.5 text-sm font-semibold tabular-nums">
//               {total.toLocaleString()}
//             </p>
//           </div>

//           <div className="text-right">
//             <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
//               Success
//             </p>

//             <p className="mt-0.5 text-sm font-semibold tabular-nums">
//               {successRate.toFixed(1)}%
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="mb-4 flex items-center gap-5 text-[11px] text-muted-foreground">
//         <div className="flex items-center gap-2">
//           <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
//           Delivered
//         </div>

//         <div className="flex items-center gap-2">
//           <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
//           Failed
//         </div>
//       </div>

//       <div className="h-[300px] w-full">
//         {chartData.length === 0 ? (
//           <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-background/20">
//             <div className="text-center">
//               <p className="text-sm font-medium">
//                 No activity data yet
//               </p>

//               <p className="mt-1 text-xs text-muted-foreground">
//                 Webhook traffic will appear here as events arrive.
//               </p>
//             </div>
//           </div>
//         ) : (
//           <ResponsiveContainer
//             width="100%"
//             height="100%"
//           >
//             <AreaChart
//               data={chartData}
//               margin={{
//                 top: 10,
//                 right: 4,
//                 left: -20,
//                 bottom: 0,
//               }}
//             >
//               <defs>
//                 <linearGradient
//                   id="dashboardSuccessGradient"
//                   x1="0"
//                   y1="0"
//                   x2="0"
//                   y2="1"
//                 >
//                   <stop
//                     offset="0%"
//                     stopColor="#f97316"
//                     stopOpacity={0.22}
//                   />

//                   <stop
//                     offset="100%"
//                     stopColor="#f97316"
//                     stopOpacity={0}
//                   />
//                 </linearGradient>

//                 <linearGradient
//                   id="dashboardFailureGradient"
//                   x1="0"
//                   y1="0"
//                   x2="0"
//                   y2="1"
//                 >
//                   <stop
//                     offset="0%"
//                     stopColor="#ef4444"
//                     stopOpacity={0.18}
//                   />

//                   <stop
//                     offset="100%"
//                     stopColor="#ef4444"
//                     stopOpacity={0}
//                   />
//                 </linearGradient>
//               </defs>

//               <CartesianGrid
//                 strokeDasharray="3 3"
//                 stroke="rgba(255,255,255,0.04)"
//                 vertical={false}
//               />

//               <XAxis
//                 dataKey="time"
//                 stroke="#71717a"
//                 tickLine={false}
//                 axisLine={false}
//                 fontSize={10}
//                 minTickGap={30}
//               />

//               <YAxis
//                 stroke="#71717a"
//                 tickLine={false}
//                 axisLine={false}
//                 fontSize={10}
//                 allowDecimals={false}
//               />

//               <Tooltip
//                 cursor={{
//                   stroke: "rgba(255,255,255,0.10)",
//                 }}
//                 contentStyle={{
//                   background: "rgba(15, 15, 15, 0.96)",
//                   border:
//                     "1px solid rgba(255,255,255,0.08)",
//                   borderRadius: "10px",
//                   fontSize: "11px",
//                   padding: "10px 12px",
//                 }}
//               />

//               <Area
//                 type="monotone"
//                 dataKey="success"
//                 name="Delivered"
//                 stroke="#f97316"
//                 fill="url(#dashboardSuccessGradient)"
//                 strokeWidth={2}
//                 dot={false}
//               />

//               <Area
//                 type="monotone"
//                 dataKey="failure"
//                 name="Failed"
//                 stroke="#ef4444"
//                 fill="url(#dashboardFailureGradient)"
//                 strokeWidth={2}
//                 dot={false}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//     </div>
//   )
// }




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

import { Activity } from "lucide-react"

export type ActivityPoint = {
  timestamp: number
  success: number
  failure: number
}

type Props = {
  activity?: ActivityPoint[] | null
}

export function ThroughputChart({
  activity = [],
}: Props) {
  const safeActivity = Array.isArray(activity)
    ? activity
    : []

  const chartData = safeActivity.map((item) => ({
    timestamp: item.timestamp,

    time: new Date(
      Number(item.timestamp) * 1000
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),

    success: Number(item.success) || 0,
    failure: Number(item.failure) || 0,
  }))

  const delivered = chartData.reduce(
    (sum, item) => sum + item.success,
    0
  )

  const failed = chartData.reduce(
    (sum, item) => sum + item.failure,
    0
  )

  const total = delivered + failed

  const successRate =
    total > 0
      ? (delivered / total) * 100
      : 100

  return (
    <div
      className="rounded-2xl border border-border bg-surface-1 p-6"
      role="img"
      aria-label={`Webhook throughput over the last 24 hours: ${total.toLocaleString()} events, ${successRate.toFixed(1)}% delivered successfully`}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <Activity className="h-4 w-4 text-orange-400" aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Event Throughput
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Webhook traffic over the last 24 hours
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Events
            </p>

            <p className="mt-0.5 text-sm font-semibold tabular-nums">
              {total.toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Success
            </p>

            <p className="mt-0.5 text-sm font-semibold tabular-nums">
              {successRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden="true" />
          Delivered
        </div>

        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
          Failed
        </div>
      </div>

      <div className="h-[300px] w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-background/20">
            <div className="text-center">
              <p className="text-sm font-medium">
                No activity data yet
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Webhook traffic will appear here as events arrive.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 4,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="dashboardSuccessGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#f97316"
                    stopOpacity={0.22}
                  />

                  <stop
                    offset="100%"
                    stopColor="#f97316"
                    stopOpacity={0}
                  />
                </linearGradient>

                <linearGradient
                  id="dashboardFailureGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#ef4444"
                    stopOpacity={0.18}
                  />

                  <stop
                    offset="100%"
                    stopColor="#ef4444"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                stroke="#71717a"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                minTickGap={30}
              />

              <YAxis
                stroke="#71717a"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                allowDecimals={false}
              />

              <Tooltip
                cursor={{
                  stroke: "rgba(255,255,255,0.10)",
                }}
                contentStyle={{
                  background: "rgba(15, 15, 15, 0.96)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  fontSize: "11px",
                  padding: "10px 12px",
                }}
              />

              <Area
                type="monotone"
                dataKey="success"
                name="Delivered"
                stroke="#f97316"
                fill="url(#dashboardSuccessGradient)"
                strokeWidth={2}
                dot={false}
              />

              <Area
                type="monotone"
                dataKey="failure"
                name="Failed"
                stroke="#ef4444"
                fill="url(#dashboardFailureGradient)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}