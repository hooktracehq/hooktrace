import { create } from "zustand"

type EventsStore = {
  selectedEventId: number | null

  paused: boolean
  connected: boolean

  bufferedEvents: Event[]

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

  flushBuffer: () =>
    set((state) => ({
      bufferedEvents: [],
    })),

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