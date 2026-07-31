"use client"

import { useQueries } from "@tanstack/react-query"
import { metricsService } from "@/lib/services/metrics"

export function useMetrics() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["metrics-overview"],
        queryFn: () => metricsService.getOverview(),
      },
      {
        queryKey: ["metrics-providers"],
        queryFn: () => metricsService.getProviders(),
      },
      {
        queryKey: ["metrics-delivery-trend"],
        queryFn: () => metricsService.getDeliveryTrend(),
      },
      {
        queryKey: ["metrics-latency-trend"],
        queryFn: () => metricsService.getLatencyTrend(),
      },
      {
        queryKey: ["metrics-stats"],
        queryFn: () => metricsService.getStats(),
      },
    ],
  })

  return {
    overview: results[0].data,
    providers: results[1].data,
    deliveryTrend: results[2].data,
    latencyTrend: results[3].data,
    stats: results[4].data,

    isLoading: results.some(
      (query) => query.isLoading
    ),

    isError: results.some(
      (query) => query.isError
    ),
  }
}