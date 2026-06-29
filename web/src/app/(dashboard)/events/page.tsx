export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"

import { EventsWorkspaceClient } from "@/components/events/events-workspace-client"

import type { Event } from "@/types/event"

async function getEvents(): Promise<Event[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events`,
      {
        credentials: "include",
        cache: "no-store",
      }
    )
    console.log(res)
    if (!res.ok) {
      return []
    }

    const data = await res.json()

    return data.items || []
  } catch {
    return []
  }
}

export default async function EventsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const events = await getEvents()
  console.log("Server Events:", events.length)

  return (
    <EventsWorkspaceClient
  initialEvents={events}
/>
  )
}



// export const dynamic = "force-dynamic"

// import { redirect } from "next/navigation"

// import { getCurrentUser } from "@/lib/auth"
// import { getEvents } from "@/lib/services/events"

// import { EventsWorkspaceClient } from "@/components/events/events-workspace-client"

// export default async function EventsPage() {
//   const user = await getCurrentUser()

//   if (!user) {
//     redirect("/login")
//   }

//   const data = await getEvents()

//   return (
//     <EventsWorkspaceClient
//       initialEvents={data?.items ?? []}
//     />
//   )
// }