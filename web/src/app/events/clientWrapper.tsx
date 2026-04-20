"use client"

import { useEffect, useState } from "react"
import { EventsTable } from "@/components/events/event-table"

type Event = {
  id: number
  route: string
  provider?: string
  event_type?: string
  status: "pending" | "delivered" | "failed"
  attempt_count: number
  created_at: string
}

type Props = {
  initialEvents: Event[]
}

export function EventsLiveWrapper({ initialEvents }: Props) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [newIds, setNewIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001/ws/events")

    ws.onmessage = (event) => {
      const newEvent: Event = JSON.parse(event.data)

      setEvents((prev: Event[]) => [newEvent, ...prev])

      setNewIds((prev: Set<number>) => {
        const updated = new Set(prev)
        updated.add(newEvent.id)
        return updated
      })

      setTimeout(() => {
        setNewIds((prev: Set<number>) => {
          const copy = new Set(prev)
          copy.delete(newEvent.id)
          return copy
        })
      }, 2000)
    }

    return () => ws.close()
  }, [])

  return <EventsTable events={events} newIds={newIds} />
}