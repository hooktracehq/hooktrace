

// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import CreateTargetModal from "@/components/delivery-targets/CreateTargetModal"
// import {
//   Plus,
//   Search,
//   Power,
//   PowerOff,
//   Trash2,
//   Activity,
//   CheckCircle2,
//   AlertTriangle,
// } from "lucide-react"
// import { motion } from "framer-motion"

// import { ThemeToggle } from "@/components/theme-toggle"
// import { UserNav } from "@/components/user-nav"
// import { StatusBadge } from "@/components/ui/status-badge"

// import { DeliveryTarget } from "@/types/delivery-target"

// /* ---------------- Types ---------------- */

// type User = {
//   email: string
//   avatar_url?: string
// }




// /* ---------------- Component ---------------- */

// export default function DeliveryTargetsClient({
//   user,
//   deliveryTargets: initialTargets,
// }: {
//   user: User
//   deliveryTargets: DeliveryTarget[]
// }) {
//   const [targets, setTargets] = useState(initialTargets)
//   const [searchQuery, setSearchQuery] = useState("")
// const [loading, setLoading] = useState(false)


//   /* ---------------- Actions ---------------- */


 
//   const handleToggle = async (id: string) => {
//     const target = targets.find(t => t.id === id)
//     if (!target) return

//     try {
//       await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${id}`, {
//         method: "PATCH",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ enabled: !target.enabled }),
//       })

//       setTargets(prev =>
//         prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t)
//       )
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   const handleDelete = async (id: string) => {
//     if (!confirm("Delete this target?")) return

//     try {
//       await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${id}`, {
//         method: "DELETE",
//         credentials: "include",
//       })

//       setTargets(prev => prev.filter(t => t.id !== id))
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   /* ---------------- Filter ---------------- */

//   const filteredTargets = targets.filter(t =>
//     t.name.toLowerCase().includes(searchQuery.toLowerCase())
//   )

//   /* ---------------- Render ---------------- */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold">Delivery Targets</h1>
//             <p className="text-sm text-muted-foreground">
//               Manage where your events are delivered
//             </p>
//           </div>

//           <div className="flex items-center gap-3">
//   <CreateTargetModal
//     onCreated={(t) => setTargets((prev) => [t, ...prev])}
//   />

//   <ThemeToggle />
//   <UserNav user={user} />
// </div>
//         </div>

//         {/* Search */}
//         <div className="relative max-w-md">
//           <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
//           <input
//             className="w-full pl-10 p-2 border rounded-lg bg-card"
//             placeholder="Search targets..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         {/* Empty */}
//         {filteredTargets.length === 0 && (
//           <div className="text-center text-muted-foreground py-10 border rounded-xl">
//             No delivery targets found
//           </div>
//         )}

//         {/* Targets Grid */}
//         <div className="grid gap-4 md:grid-cols-2">

//           {filteredTargets.map((target) => {
//             const total = target.successCount + target.errorCount
//             const successRate =
//               total > 0 ? (target.successCount / total) * 100 : 100

//             const isHealthy = successRate >= 95

//             return (
//               <motion.div
//                 key={target.id}
//                 layout
//                 className="rounded-xl border bg-card p-5 space-y-4 hover:shadow-sm transition"
//               >

//                 {/* Top */}
//                 <div className="flex justify-between items-start">

//                   <div>
//                     <h3 className="font-semibold text-base">
//                       {target.name}
//                     </h3>

//                     <p className="text-xs text-muted-foreground">
//                       {target.type}
//                     </p>
//                   </div>

//                   <div className="flex items-center gap-2">

//                     {target.enabled ? (
//                       <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">
//                         Active
//                       </span>
//                     ) : (
//                       <span className="text-xs px-2 py-1 rounded bg-muted">
//                         Disabled
//                       </span>
//                     )}

//                   </div>
//                 </div>

//                 {/* Metrics */}
//                 <div className="grid grid-cols-3 gap-3 text-xs">

//                   <div>
//                     <p className="text-muted-foreground">Success</p>
//                     <p className="font-medium">{target.successCount}</p>
//                   </div>

//                   <div>
//                     <p className="text-muted-foreground">Errors</p>
//                     <p className="font-medium">{target.errorCount}</p>
//                   </div>

//                   <div>
//                     <p className="text-muted-foreground">Rate</p>
//                     <p className="font-medium">
//                       {successRate.toFixed(0)}%
//                     </p>
//                   </div>

//                 </div>

//                 {/* Health */}
//                 <div className="flex items-center gap-2 text-xs">
//                   {isHealthy ? (
//                     <CheckCircle2 className="w-4 h-4 text-emerald-500" />
//                   ) : (
//                     <AlertTriangle className="w-4 h-4 text-amber-500" />
//                   )}

//                   <span className="text-muted-foreground">
//                     {isHealthy ? "Healthy" : "Issues detected"}
//                   </span>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex justify-between items-center pt-2 border-t">

//                   <div className="flex gap-2">

//                     <button
//                       onClick={() => handleToggle(target.id)}
//                       className="text-xs px-2 py-1 border rounded hover:bg-muted"
//                     >
//                       {target.enabled ? "Disable" : "Enable"}
//                     </button>

//                     <button
//                       onClick={() => handleDelete(target.id)}
//                       className="text-xs px-2 py-1 border rounded hover:bg-muted"
//                     >
//                       Delete
//                     </button>

//                   </div>

//                   <Link
//                     href={`/delivery-targets/${target.id}`}
//                     className="text-xs text-primary"
//                   >
//                     View →
//                   </Link>

//                 </div>

//               </motion.div>
//             )
//           })}

//         </div>

       
   

//       </div>
//     </div>
//   )
// }



















"use client"

import { useState } from "react"
import Link from "next/link"
import CreateTargetModal from "@/components/delivery-targets/CreateTargetModal"
import {
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { motion } from "framer-motion"

import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

import { DeliveryTarget } from "@/types/delivery-target"

type User = {
  email: string
  avatar_url?: string
}

export default function DeliveryTargetsClient({
  user,
  deliveryTargets: initialTargets,
}: {
  user: User
  deliveryTargets: DeliveryTarget[]
}) {
  const [targets, setTargets] = useState(initialTargets)
  const [searchQuery, setSearchQuery] = useState("")

  const handleToggle = async (id: string) => {
    const target = targets.find(t => t.id === id)
    if (!target) return

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !target.enabled }),
    })

    setTargets(prev =>
      prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t)
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this target?")) return

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${id}`, {
      method: "DELETE",
      credentials: "include",
    })

    setTargets(prev => prev.filter(t => t.id !== id))
  }

  const filteredTargets = targets.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Delivery Targets</h1>
            <p className="text-sm text-muted-foreground">
              Manage where your events are delivered
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CreateTargetModal
              onCreated={(t) => setTargets((prev) => [t, ...prev])}
            />
            <ThemeToggle />
            <UserNav user={user} />
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-10 p-2 border rounded-xl bg-card"
            placeholder="Search targets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Empty */}
        {filteredTargets.length === 0 && (
          <div className="text-center py-16 border rounded-2xl">
            <p className="text-lg font-medium">No delivery targets yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first target to start receiving events
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-2">

          {filteredTargets.map((target) => {
            const total = target.successCount + target.errorCount
            const successRate =
              total > 0 ? (target.successCount / total) * 100 : 100

            const isHealthy = successRate >= 95

            return (
              <motion.div
                key={target.id}
                layout
                className="rounded-2xl border bg-card p-5 space-y-4 hover:shadow-md transition-all"
              >

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-base">{target.name}</h3>

                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {target.type}
                      </span>

                      {target.providers?.map(p => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-muted">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`text-xs px-2 py-1 rounded ${
                    target.enabled
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted"
                  }`}>
                    {target.enabled ? "Active" : "Disabled"}
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="h-2 rounded bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${successRate}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                    <span>{target.successCount} success</span>
                    <span>{target.errorCount} errors</span>
                  </div>
                </div>

                {/* Health */}
                <div className="flex items-center gap-2 text-sm">
                  {isHealthy ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}

                  <span>
                    {isHealthy ? "Healthy" : "Issues detected"} ({successRate.toFixed(0)}%)
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(target.id)}
                      className="text-xs px-2 py-1 rounded border hover:bg-muted"
                    >
                      {target.enabled ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={() => handleDelete(target.id)}
                      className="text-xs px-2 py-1 rounded border hover:bg-muted"
                    >
                      Delete
                    </button>
                  </div>

                  <Link
                    href={`/delivery-targets/${target.id}`}
                    className="text-xs font-medium text-primary"
                  >
                    View →
                  </Link>
                </div>

              </motion.div>
            )
          })}

        </div>
      </div>
    </div>
  )
}