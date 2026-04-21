"use client"

import { useEffect, useState } from "react"
import { EventsTable } from "@/components/events/event-table"
import { Event } from "@/types/event"

type Props = {
  initialEvents: Event[]
  status?: string
}

export function EventsLiveWrapper({ initialEvents, status }: Props) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [newIds, setNewIds] = useState<Set<number>>(new Set())

  //  Always sync with server data
  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

  //  ONLY enable websocket for "All Events"
  useEffect(() => {
    if (status) return 

    const ws = new WebSocket("ws://localhost:3001/ws/events")

    ws.onmessage = (event) => {
      const newEvent: Event = JSON.parse(event.data)

      setEvents((prev) => [newEvent, ...prev])

      setNewIds((prev) => {
        const updated = new Set(prev)
        updated.add(newEvent.id)
        return updated
      })

      setTimeout(() => {
        setNewIds((prev) => {
          const copy = new Set(prev)
          copy.delete(newEvent.id)
          return copy
        })
      }, 2000)
    }

    return () => ws.close()
  }, [status])

  return <EventsTable events={events} newIds={newIds} />
}