"use client"

import { useDlqCount } from "@/hooks/use-dlq"

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
  const { data, isLoading } = useDlqCount()

  return (
    <div className="grid grid-cols-4 border-b border-border">

      <StatCard
        title="Failed Deliveries"
        value="—"
        subtitle="Currently requiring attention"
      />

      <StatCard
        title="Dead Letters"
        value={
          isLoading
            ? "..."
            : data?.dlq_count ?? 0
        }
        subtitle="Retries exhausted"
      />

      <StatCard
        title="Active Retries"
        value="—"
        subtitle="Recovery in progress"
      />

      <StatCard
        title="Recovery Rate"
        value="—"
        subtitle="Past 24 hours"
        bordered={false}
      />

    </div>
  )
}