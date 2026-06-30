"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { AggregationRule } from "@/types/aggregation"

type Props = {
  rule: AggregationRule
  selected?: boolean
  onClick?: () => void
}

export function AggregationRow({
  rule,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
        grid
        grid-cols-[90px_1.8fr_130px_120px_120px]
        items-center
        border-b
        border-border
        px-5
        py-4
        text-left
        transition-all
        hover:bg-muted/40
      `,
        selected &&
          "bg-muted border-l-2 border-l-orange-500"
      )}
    >
      {/* Status */}

      <div>
        <Badge
          variant={
            rule.enabled
              ? "default"
              : "secondary"
          }
        >
          {rule.enabled
            ? "Enabled"
            : "Disabled"}
        </Badge>
      </div>

      {/* Rule */}

      <div className="min-w-0">

        <p className="truncate font-medium">
          {rule.name}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">

          {rule.eventPatterns
            .slice(0, 2)
            .map((pattern) => (
              <span
                key={pattern}
                className="
                  rounded-md
                  bg-muted
                  px-2
                  py-0.5
                  text-[10px]
                  text-muted-foreground
                "
              >
                {pattern}
              </span>
            ))}

          {rule.eventPatterns.length >
            2 && (
            <span className="text-xs text-muted-foreground">
              +
              {rule.eventPatterns.length -
                2}
            </span>
          )}

        </div>

      </div>

      {/* Provider */}

      <div>

        <span
          className="
            rounded-md
            border
            border-border
            px-2
            py-1
            text-xs
            uppercase
          "
        >
          {rule.provider ??
            "ANY"}
        </span>

      </div>

      {/* Mode */}

      <div className="capitalize">

        {rule.config.mode}

      </div>

      {/* Saved */}

      <div className="font-medium">

        {rule.stats.duplicatesSkipped.toLocaleString()}

      </div>

    </button>
  )
}