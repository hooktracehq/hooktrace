export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"

import { getCurrentUser } from "@/lib/auth"
import { EventsWorkspaceClient } from "@/components/events/events-workspace-client"

import type { Event } from "@/types/event"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"

async function getEvents(): Promise<Event[]> {
  try {
    const cookieStore = await cookies()

    const cookieHeader = cookieStore
      .getAll()
      .map(
        (cookie) =>
          `${cookie.name}=${cookie.value}`
      )
      .join("; ")

    const res = await fetch(
      `${API_URL}/events`,
      {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      }
    )

    if (!res.ok) {
      console.error(
        "Failed to fetch server events:",
        res.status,
        res.statusText
      )

      return []
    }

    const data = await res.json()

    return data.items || []
  } catch (error) {
    console.error(
      "Failed to fetch server events:",
      error
    )

    return []
  }
}

export default async function EventsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const events = await getEvents()

  console.log(
    "Server Events:",
    events.length
  )

  return (
    <EventsWorkspaceClient
      initialEvents={events}
    />
  )
}