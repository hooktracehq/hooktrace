// "use client"

// import {
//   Activity,
//   AlertTriangle,
//   RotateCcw,
//   Server,
//   CheckCircle2,
// } from "lucide-react"

// const items = [
//   {
//     icon: Activity,
//     message: "Webhook received",
//     provider: "stripe",
//     time: "2s ago",
//     color: "orange",
//   },

//   {
//     icon: RotateCcw,
//     message: "Replay queued",
//     provider: "github",
//     time: "12s ago",
//     color: "amber",
//   },

//   {
//     icon: AlertTriangle,
//     message: "Delivery failed",
//     provider: "shopify",
//     time: "18s ago",
//     color: "red",
//   },

//   {
//     icon: CheckCircle2,
//     message: "Retry succeeded",
//     provider: "discord",
//     time: "30s ago",
//     color: "emerald",
//   },

//   {
//     icon: Server,
//     message: "Worker restarted",
//     provider: "infra",
//     time: "1m ago",
//     color: "blue",
//   },
// ]

// const colors = {
//   orange: "bg-orange-500 text-orange-400",
//   amber: "bg-amber-500 text-amber-400",
//   red: "bg-rose-500 text-rose-400",
//   emerald: "bg-emerald-500 text-emerald-400",
//   blue: "bg-sky-500 text-sky-400",
// }

// export function ActivityFeed() {
//   return (
//     <div className="rounded-2xl border border-border bg-surface-1 p-6">

//       <div className="mb-6 flex items-center justify-between">

//         <div>
//           <h2 className="text-lg font-semibold">
//             Live Activity
//           </h2>

//           <p className="mt-1 text-sm text-muted-foreground">
//             realtime operational events
//           </p>
//         </div>

//         <div className="flex items-center gap-2 text-xs text-emerald-400">
//           <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
//           LIVE
//         </div>

//       </div>

//       <div className="space-y-3">

//         {items.map((item, index) => {
//           const Icon = item.icon

//           return (
//             <div
//               key={index}
//               className="
//                 flex items-center justify-between
//                 rounded-xl border border-border
//                 bg-background/20
//                 p-4 transition-all
//                 hover:bg-white/[0.02]
//               "
//             >

//               <div className="flex items-center gap-3">

//                 <div
//                   className="
//                     flex h-10 w-10 items-center justify-center
//                     rounded-xl border border-border
//                     bg-background/40
//                   "
//                 >
//                   <Icon
//                     className={`h-4 w-4 ${
//                       colors[
//                         item.color as keyof typeof colors
//                       ].split(" ")[1]
//                     }`}
//                   />
//                 </div>

//                 <div>

//                   <p className="text-sm font-medium">
//                     {item.message}
//                   </p>

//                   <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">

//                     <span>
//                       {item.provider}
//                     </span>

//                     <span>•</span>

//                     <span>
//                       {item.time}
//                     </span>

//                   </div>

//                 </div>

//               </div>

//               <div
//                 className={`
//                   h-2.5 w-2.5 rounded-full
//                   ${
//                     colors[
//                       item.color as keyof typeof colors
//                     ].split(" ")[0]
//                   }
//                 `}
//               />

//             </div>
//           )
//         })}

//       </div>
//     </div>
//   )
// }