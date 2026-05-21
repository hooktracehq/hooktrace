import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

import { ThroughputChart } from "@/components/dashboard/throughput-chart"

import { RecentFailures } from "@/components/dashboard/recent-failures"

import { InfraHealth } from "@/components/dashboard/infra-health"

import { QuickActions } from "@/components/dashboard/quick-actions"

import { SystemStatus } from "@/components/dashboard/system-status"

import { ActivityFeed } from "@/components/dashboard/activity-feed"

import { IncidentBanner } from "@/components/dashboard/incident-banner"

import { ProviderBreakdown } from "@/components/dashboard/provider-breakdown"

import { EventHeatmap } from "@/components/dashboard/event-heatmap"

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      <IncidentBanner />

      <DashboardOverview />

      <div className="grid grid-cols-12 gap-6">

        <ThroughputChart />

        <RecentFailures />

      </div>

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-12 xl:col-span-4">
          <ProviderBreakdown />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <InfraHealth />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <SystemStatus />
        </div>

      </div>

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-12 xl:col-span-6">
          <ActivityFeed />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <EventHeatmap />
        </div>

      </div>

      <QuickActions />

    </div>
  )
}