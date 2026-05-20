// import { create } from "zustand"

// import type { Event } from "@/types/event"

// type EventsStore = {
//   events: Event[]
//   selectedEvent: Event | null
//   paused: boolean
//   connected: boolean
//   bufferedEvents: Event[]
//   flushBuffer: () => void

//   setEvents: (events: Event[]) => void

//   addEvent: (event: Event) => void

//   selectEvent: (event: Event) => void

//   togglePause: () => void

//   setConnected: (state: boolean) => void
// }

// export const useEventsStore =
//   create<EventsStore>((set) => ({
//     events: [],
//     selectedEvent: null,
//     paused: false,
//     connected: false,

//     setEvents: (events) =>
//       set({
//         events,
//       }),

//       addEvent: (event) =>
//         set((state) => {
      
//           // paused → buffer
//           if (state.paused) {
//             return {
//               bufferedEvents: [
//                 event,
//                 ...state.bufferedEvents,
//               ],
//             }
//           }
      
//           // live insert
//           return {
//             events: [
//               event,
//               ...state.events,
//             ],
//           }
//         }),

//         flushBuffer: () =>
//           set((state) => ({
//             events: [
//               ...state.bufferedEvents,
//               ...state.events,
//             ],
        
//             bufferedEvents: [],
//           })),

//     selectEvent: (event) =>
//       set({
//         selectedEvent: event,
//       }),

//     togglePause: () =>
//       set((state) => ({
//         paused: !state.paused,
//       })),

//     setConnected: (
//       connected
//     ) =>
//       set({
//         connected,
//       }),
//   }))




import { create } from "zustand"

import type { Event } from "@/types/event"

type EventsStore = {
  events: Event[]
  selectedEvent: Event | null

  paused: boolean
  connected: boolean

  bufferedEvents: Event[]

  flushBuffer: () => void

  setEvents: (
    events: Event[]
  ) => void

  addEvent: (
    event: Event
  ) => void

  selectEvent: (
    event: Event
  ) => void

  togglePause: () => void

  setConnected: (
    state: boolean
  ) => void
}

export const useEventsStore =
  create<EventsStore>((set) => ({
    events: [],

    selectedEvent: null,

    paused: false,

    connected: false,

    bufferedEvents: [],

    setEvents: (events) =>
      set({
        events,
      }),

    addEvent: (event) =>
      set((state) => {

        // paused → buffer
        if (state.paused) {
          return {
            bufferedEvents: [
              event,
              ...state.bufferedEvents,
            ],
          }
        }

        // live insert
        return {
          events: [
            event,
            ...state.events,
          ],
        }
      }),

    flushBuffer: () =>
      set((state) => ({
        events: [
          ...state.bufferedEvents,
          ...state.events,
        ],

        bufferedEvents: [],
      })),

    selectEvent: (event) =>
      set({
        selectedEvent: event,
      }),

    togglePause: () =>
      set((state) => ({
        paused: !state.paused,
      })),

    setConnected: (
      connected
    ) =>
      set({
        connected,
      }),
  }))