"use client"

import { motion } from "framer-motion"

import type {
  LucideIcon,
} from "lucide-react"

type Props = {
  label: string
  value: string | number

  icon: LucideIcon

  change?: string

  color?: string
}

export function MetricsCard({
  label,
  value,
  icon: Icon,
  change,
  color,
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
rounded-2xl
border border-border/60
bg-surface-1
p-6
shadow-sm
transition-all
hover:border-primary/20
hover:shadow-lg
"
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
  {typeof value === "number"
    ? value.toLocaleString()
    : value}
</h2>

          {change && (
            <p className="mt-2 text-xs text-muted-foreground">
              {change}
            </p>
          )}

        </div>

        <div
          className="
            flex h-11 w-11
            items-center justify-center
            rounded-xl border border-border
            bg-background
          "
        >
          <Icon
            className={`h-5 w-5 ${
              color ||
              "text-primary"
            }`}
          />
        </div>

      </div>

    </motion.div>
  )
}