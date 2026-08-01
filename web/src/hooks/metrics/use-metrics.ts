"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { metricsService } from "@/lib/services/metrics";

export function useMetrics() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["metrics-overview"],
        queryFn: metricsService.getOverview,
        refetchInterval: 5000,
      },
      {
        queryKey: ["metrics-providers"],
        queryFn: metricsService.getProviders,
        refetchInterval: 5000,
      },
      {
        queryKey: ["metrics-delivery-trend"],
        queryFn: metricsService.getDeliveryTrend,
        refetchInterval: 5000,
      },
      {
        queryKey: ["metrics-latency-trend"],
        queryFn: metricsService.getLatencyTrend,
        refetchInterval: 5000,
      },
      {
        queryKey: ["metrics-stats"],
        queryFn: metricsService.getStats,
        refetchInterval: 5000,
      },
    ],
  });

  const recent = useQuery({
    queryKey: ["metrics-recent"],
    queryFn: metricsService.getRecentActivity,
    refetchInterval: 5000,
  });

  return {
    overview: results[0].data,
    providers: results[1].data,
    deliveryTrend: results[2].data,
    latencyTrend: results[3].data,
    stats: results[4].data,
    recentActivity: recent.data ?? [],

    isLoading:
      results.some((query) => query.isLoading) ||
      recent.isLoading,

    isError:
      results.some((query) => query.isError) ||
      recent.isError,

    refetch: () => {
      results.forEach((query) => query.refetch());
      recent.refetch();
    },
  };
}