// "use client"

// import { useQuery } from "@tanstack/react-query"

// import { getEvents } from "@/lib/services/events"

// type EventFilters = {
//   status?: string
//   provider?: string
//   limit?: number
//   offset?: number
// }

// export function useEvents(
//   filters?: EventFilters
// ) {
//   return useQuery({
//     queryKey: [
//       "events",
//       filters ?? {},
//     ],
//     queryFn: () =>
//       getEvents(filters),
//   })
// }




"use client"

import { useQuery } from "@tanstack/react-query"
import { getEvents } from "@/lib/services/events"

type EventFilters = {
    status?: string
    provider?: string
    limit?: number
    offset?: number
  }
export function useEvents(filters?: EventFilters) {
  console.log("🔥 useEvents hook rendered", filters)

  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      console.log("🚀 queryFn running")

      const data = await getEvents(filters)

      console.log("✅ queryFn result", data)

      return data
    },
  })
}