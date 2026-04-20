import { LucideIcon } from "lucide-react"

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="p-2 bg-primary/10 rounded-lg w-fit mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}