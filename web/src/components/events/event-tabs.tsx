// "use client";

// import Link from "next/link";
// import { useSearchParams } from "next/navigation";

// export function EventsTabs() {
//   const searchParams = useSearchParams();
//   const status = searchParams.get("status");

//   const tabClass = (value?: string) =>
//     `px-3 py-1 rounded text-sm ${
//       status === value || (!status && !value)
//         ? "bg-primary text-white"
//         : "bg-muted"
//     }`;

//   return (
//     <div className="flex gap-2">
//       <Link href="/events" className={tabClass(undefined)}>
//         All
//       </Link>
//       <Link href="/events?status=pending" className={tabClass("pending")}>
//         Pending
//       </Link>
//       <Link href="/events?status=delivered" className={tabClass("delivered")}>
//         Delivered
//       </Link>
//       <Link href="/events?status=failed" className={tabClass("failed")}>
//         DLQ
//       </Link>
//     </div>
//   );
// }



// "use client"

// import * as Tabs from "@radix-ui/react-tabs"
// import { useSearchParams, useRouter } from "next/navigation"
// import { motion } from "framer-motion"
// import clsx from "clsx"

// const TABS = [
//   { label: "All", value: "all" },
//   { label: "Pending", value: "pending" },
//   { label: "Delivered", value: "delivered" },
//   { label: "DLQ", value: "failed" },
// ]

// export function EventsTabs() {
//   const searchParams = useSearchParams()
//   const router = useRouter()

//   const status = searchParams.get("status") ?? "all"

//   function onValueChange(value: string) {
//     if (value === "all") {
//       router.push("/events")
//     } else {
//       router.push(`/events?status=${value}`)
//     }
//   }

//   return (
//     <Tabs.Root
//       value={status}
//       onValueChange={onValueChange}
//       className="w-fit"
//     >
//       <Tabs.List className="relative inline-flex items-center rounded-lg border border-border bg-muted/40 p-1">
//         {TABS.map((tab) => {
//           const isActive = status === tab.value

//           return (
//             <Tabs.Trigger
//               key={tab.value}
//               value={tab.value}
//               className={clsx(
//                 "relative z-10 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
//                 isActive
//                   ? "text-primary-foreground"
//                   : "text-muted-foreground hover:text-foreground"
//               )}
//             >
//               {isActive && (
//                 <motion.span
//                   layoutId="events-tabs-indicator"
//                   className="absolute inset-0 -z-10 rounded-md bg-primary"
//                   transition={{
//                     type: "spring",
//                     stiffness: 420,
//                     damping: 30,
//                   }}
//                 />
//               )}

//               {tab.label}
//             </Tabs.Trigger>
//           )
//         })}
//       </Tabs.List>
//     </Tabs.Root>
//   )
// }





// "use client"

// import Link from "next/link"
// import { useSearchParams } from "next/navigation"
// import { Activity, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

// export function EventsTabs() {
//   const searchParams = useSearchParams()
//   const currentStatus = searchParams.get("status")

//   const tabs = [
//     { label: "All Events", icon: Activity, href: "/events", status: null },
//     { label: "Pending", icon: Clock, href: "/events?status=pending", status: "pending" },
//     { label: "Delivered", icon: CheckCircle2, href: "/events?status=delivered", status: "delivered" },
//     { label: "Failed", icon: XCircle, href: "/events?status=failed", status: "failed" },
//     { label: "DLQ", icon: AlertTriangle, href: "/events?status=dlq", status: "dlq" },
//   ]

//   return (
//     <div className="flex items-center gap-2 overflow-x-auto">
//       {tabs.map((tab) => {
//         const isActive = currentStatus === tab.status
//         const Icon = tab.icon

//         return (
//           <Link
//             key={tab.href}
//             href={tab.href}
//             className={`
//               flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
//               transition-all whitespace-nowrap
//               ${isActive
//                 ? "bg-primary text-primary-foreground shadow-sm"
//                 : "hover:bg-accent text-muted-foreground hover:text-foreground"
//               }
//             `}
//           >
//             <Icon className="w-4 h-4" />
//             {tab.label}
//           </Link>
//         )
//       })}
//     </div>
//   )
// }





// "use client"
// import Link from "next/link"
// import { useSearchParams } from "next/navigation"

// export function EventsTabs() {
//   const searchParams = useSearchParams()
//   const current = searchParams.get("status")

//   const tabs = [
//     { label: "All", value: null },
//     { label: "Pending", value: "pending" },
//     { label: "Delivered", value: "delivered" },
//     { label: "Failed", value: "failed" },
//     { label: "DLQ", value: "dlq" },
//   ]

//   return (
//     <div className="flex gap-2">
//       {tabs.map((tab) => {
//         const href = tab.value ? `/events?status=${tab.value}` : "/events"
//         const active = current === tab.value || (!current && !tab.value)

//         return (
//           <Link
//             key={tab.label}
//             href={href}
//             className={`px-3 py-1.5 rounded-lg text-sm ${
//               active
//                 ? "bg-primary text-white"
//                 : "text-muted-foreground hover:bg-muted"
//             }`}
//           >
//             {tab.label}
//           </Link>
//         )
//       })}
//     </div>
//   )
// }






"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export function EventsTabs() {
  const searchParams = useSearchParams()
  const current = searchParams.get("status")

  const tabs = [
    { label: "All", value: null },
    { label: "Pending", value: "pending" },
    { label: "Delivered", value: "delivered" },
    { label: "Failed", value: "failed" },
    { label: "DLQ", value: "dlq" },
  ]

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => {
        const href = tab.value ? `/events?status=${tab.value}` : "/events"
        const isActive =
          (tab.value === null && !current) || current === tab.value

        return (
          <Link
            key={tab.label}
            href={href}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              isActive
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}