"use client"

import { useQuery } from "@tanstack/react-query"

import {
  getDestinations,
} from "@/lib/services/destinations"

export function useDestinations() {
  return useQuery({
    queryKey: ["destinations"],

    queryFn: getDestinations,
  })
}