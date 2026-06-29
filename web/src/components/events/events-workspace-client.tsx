"use client"

import { useEvents } from "@/hooks/use-events"
import { useLiveEvents } from "@/hooks/use-live-events"

import { useEventsStore } from "@/app/stores/events-store"

import { EventWorkspace } from "./event-workspace"

import type { Event } from "@/types/event"

type Props = {
  initialEvents: Event[]
}

export function EventsWorkspaceClient({
  initialEvents,
}: Props) {

  const { data, isLoading } =
    useEvents()

  useLiveEvents()

  const events =
    data?.items ??
    initialEvents

  const selectedEventId =
    useEventsStore(
      (s) => s.selectedEventId
    )

  const selectedEvent =
    events.find(
      (e) =>
        e.id === selectedEventId
    ) ?? null

  const selectEvent =
    useEventsStore(
      (s) => s.selectEvent
    )

  return (
    <EventWorkspace
      events={events}
      loading={isLoading}
      selectedEvent={selectedEvent}
      onSelectEvent={(event) =>
        selectEvent(event.id)
      }
    />
  )
}