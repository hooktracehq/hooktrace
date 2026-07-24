"use client"

import { useIssueStats } from "@/hooks/issues/useIssueStats"
type StatCardProps = {
  title: string
  value: string | number
  subtitle: string
  bordered?: boolean
}

function StatCard({
  title,
  value,
  subtitle,
  bordered = true,
}: StatCardProps) {
  return (
    <div
      className={`
        px-5 py-4
        ${bordered ? "border-r border-border" : ""}
      `}
    >
      <p className="text-xs text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {subtitle}
      </p>
    </div>
  )
}

export function IssueStats() {
  const { data, isLoading } = useIssueStats()
  return (
    <div className="grid grid-cols-4 border-b border-border">
<StatCard
  title="Failed Deliveries"
  value={
    isLoading
      ? "..."
      : data?.failed_deliveries ?? 0
  }
  subtitle="Currently requiring attention"
/>

      <StatCard
        title="Dead Letters"
        value={
          isLoading
            ? "..."
            : data?.dead_letters ?? 0
        }
        subtitle="Retries exhausted"
      />

<StatCard
  title="Active Retries"
  value={
    isLoading
      ? "..."
      : data?.active_retries ?? 0
  }
  subtitle="Recovery in progress"
/>

<StatCard
  title="Recovery Rate"
  value={
    isLoading
      ? "..."
      : `${data?.recovery_rate ?? 100}%`
  }
  subtitle="Overall delivery health"
  bordered={false}
/>

    </div>
  )
}