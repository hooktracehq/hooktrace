import { create } from "zustand"

import type { Event } from "@/types/event"

type EventsStore = {
  selectedEventId: number | null

  paused: boolean
  connected: boolean

  bufferedEvents: Event[]

  addEvent: (event: Event) => void
  flushBuffer: () => void

  selectEvent: (id: number | null) => void

  togglePause: () => void

  setConnected: (state: boolean) => void
}

export const useEventsStore = create<EventsStore>((set) => ({
  selectedEventId: null,

  paused: false,

  connected: false,

  bufferedEvents: [],

  addEvent: (event) =>
    set((state) => ({
      bufferedEvents: [...state.bufferedEvents, event],
    })),

  flushBuffer: () =>
    set({
      bufferedEvents: [],
    }),

  selectEvent: (id) =>
    set({
      selectedEventId: id,
    }),

  togglePause: () =>
    set((state) => ({
      paused: !state.paused,
    })),

  setConnected: (connected) =>
    set({
      connected,
    }),
}))