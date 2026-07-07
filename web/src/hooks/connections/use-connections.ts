"use client"

import { useQuery } from "@tanstack/react-query"

import {
  getConnections,
} from "@/lib/services/connections"

export function useConnections() {
  return useQuery({
    queryKey: ["connections"],

    queryFn: getConnections,
  })
}