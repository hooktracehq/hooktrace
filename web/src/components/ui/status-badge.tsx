import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "delivered" | "failed" | "pending"

const config = {
  delivered: {
    icon: CheckCircle2,
    label: "Delivered",
    className: "bg-secondary/10 text-secondary border border-secondary/20",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "bg-destructive/10 text-destructive border border-destructive/20",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-muted text-muted-foreground border border-border",
  },
}

export function StatusBadge({ status }: { status: string }) {
  const c = config[status as Status]

  //  SAFETY FALLBACK 
  if (!c) {
    console.warn("Unknown status:", status)

    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-sm bg-muted text-muted-foreground border border-border">
        Unknown
      </div>
    )
  }

  const Icon = c.icon

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium",
        c.className
      )}
    >
      <Icon className="w-4 h-4" />
      {c.label}
    </div>
  )
}