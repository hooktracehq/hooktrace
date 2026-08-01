"use client";

import { MetricsOverview } from "@/components/metrics/metrics-overview";
import { ThroughputChart } from "@/components/metrics/ThroughputChart";
import { ProviderDistribution } from "@/components/metrics/provider-distribution";
import { LatencyChart } from "@/components/metrics/latency-chart";
import { RecentActivity } from "@/components/metrics/RecentActivity";
import { StatusBreakdown } from "@/components/metrics/StatusBreakdown";

import { useMetrics } from "@/hooks/metrics/use-metrics";

export default function MetricsClient() {
  const {
    overview,
    providers,
    deliveryTrend,
    latencyTrend,
    recentActivity,
    isLoading,
    isError,
  } = useMetrics();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        Loading metrics...
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div className="flex h-96 items-center justify-center text-red-500">
        Failed to load metrics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MetricsOverview
        received={overview.received}
        delivered={overview.delivered}
        failed={overview.failed}
        retried={overview.retried}
        successRate={overview.success_rate}
        latency={overview.avg_latency}
      />

      <ThroughputChart
        data={
          deliveryTrend?.map((item) => ({
            time: item.time,
            events: item.value,
          })) ?? []
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ProviderDistribution
          data={
            providers?.map((provider) => ({
              name: provider.provider,
              value: provider.delivered,
            })) ?? []
          }
        />

        <LatencyChart
          data={
            latencyTrend?.map((item) => ({
              time: item.time,
              latency: item.value,
            })) ?? []
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StatusBreakdown
          delivered={overview.delivered}
          failed={overview.failed}
          retried={overview.retried}
          pending={
            Math.max(
              0,
              overview.received -
                overview.delivered -
                overview.failed
            )
          }
        />

        <RecentActivity
          items={
            recentActivity?.map((event) => ({
              id: event.id,
              provider: event.provider,
              event: event.event_type,
              status: event.status,
              latency: event.latency ?? 0,
              time: new Date(
                event.created_at
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            })) ?? []
          }
        />
      </div>
    </div>
  );
}