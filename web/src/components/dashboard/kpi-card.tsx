"use client"

import { motion } from "framer-motion"

import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type Props = {
  title: string
  value: string | number
  change?: string
  icon: LucideIcon
  accent?: "orange" | "emerald" | "red" | "blue"
}

const accents = {
  orange: {
    icon: "text-orange-400",
    glow: "shadow-orange-500/10",
    dot: "bg-orange-500",
  },

  emerald: {
    icon: "text-emerald-400",
    glow: "shadow-emerald-500/10",
    dot: "bg-emerald-500",
  },

  red: {
    icon: "text-rose-400",
    glow: "shadow-rose-500/10",
    dot: "bg-rose-500",
  },

  blue: {
    icon: "text-sky-400",
    glow: "shadow-sky-500/10",
    dot: "bg-sky-500",
  },
}

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  accent = "orange",
}: Props) {
  const styles = accents[accent]

  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.2,
      }}
      className={cn(
        `
          group relative overflow-hidden
          rounded-2xl border border-border
          bg-surface-1
          p-5
          transition-all duration-300
          hover:border-white/10
          hover:shadow-2xl
        `,
        styles.glow
      )}
    >
      {/* top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-start justify-between">

        <div>

          <div className="flex items-center gap-2">

            <div
              className={cn(
                "h-2 w-2 rounded-full animate-pulse",
                styles.dot
              )}
            />

            <p className="text-sm text-muted-foreground">
              {title}
            </p>

          </div>

          <div className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
            {value}
          </div>

          {change && (
            <p className="mt-2 text-xs text-muted-foreground">
              {change}
            </p>
          )}

        </div>

        <div
          className="
            flex h-14 w-14 items-center justify-center
            rounded-2xl border border-border
            bg-background/40
            transition-all
            group-hover:scale-105
          "
        >
          <Icon
            className={cn(
              "h-6 w-6",
              styles.icon
            )}
          />
        </div>

      </div>
    </motion.div>
  )
}