import { create } from "zustand"

type Activity = {
  id: string
  message: string
  level:
    | "info"
    | "success"
    | "warning"
    | "error"
  timestamp: string
}

type RealtimeState = {
  connected: boolean
  reconnecting: boolean
  latency: number
  throughput: number
  eventsPerSecond: number

  activities: Activity[]

  setConnected: (
    value: boolean
  ) => void

  setReconnecting: (
    value: boolean
  ) => void

  setLatency: (
    value: number
  ) => void

  setThroughput: (
    value: number
  ) => void

  setEventsPerSecond: (
    value: number
  ) => void

  addActivity: (
    activity: Activity
  ) => void

  clearActivities: () => void
}

export const useRealtimeStore =
  create<RealtimeState>(
    (set) => ({
      connected: false,
      reconnecting: false,
      latency: 0,
      throughput: 0,
      eventsPerSecond: 0,

      activities: [],

      setConnected: (
        value
      ) =>
        set({
          connected: value,
        }),

      setReconnecting: (
        value
      ) =>
        set({
          reconnecting: value,
        }),

      setLatency: (
        value
      ) =>
        set({
          latency: value,
        }),

      setThroughput: (
        value
      ) =>
        set({
          throughput: value,
        }),

      setEventsPerSecond: (
        value
      ) =>
        set({
          eventsPerSecond: value,
        }),

      addActivity: (
        activity
      ) =>
        set((state) => ({
          activities: [
            activity,
            ...state.activities,
          ].slice(0, 50),
        })),

      clearActivities: () =>
        set({
          activities: [],
        }),
    })
  )