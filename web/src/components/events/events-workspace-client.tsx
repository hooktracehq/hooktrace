"use client"

import { useEffect } from "react"

import { EventWorkspace } from "./event-workspace"

import { useEventsStore } from "@/app/stores/events-store"

import { useLiveEvents } from "@/hooks/use-live-events"

import type { Event } from "@/types/event"

type Props = {
  initialEvents: Event[]
}

export function EventsWorkspaceClient({
  initialEvents,
}: Props) {

  const events =
    useEventsStore(
      (s) => s.events
    )

  const selectedEvent =
    useEventsStore(
      (s) => s.selectedEvent
    )

  const setEvents =
    useEventsStore(
      (s) => s.setEvents
    )

  const selectEvent =
    useEventsStore(
      (s) => s.selectEvent
    )

  // Hydrate initial server data
  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents, setEvents])

  // Start websocket
  useLiveEvents()

  return (
    <EventWorkspace
      events={events}
      selectedEvent={selectedEvent}
      onSelectEvent={selectEvent}
    />
  )
}