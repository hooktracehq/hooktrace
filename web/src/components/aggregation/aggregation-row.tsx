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
        grid-cols-[100px_1.8fr_140px_130px_140px]
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
          "border-l-2 border-l-orange-500 bg-orange-500/5"
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
          className="w-fit"
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
              <code
                key={pattern}
                className="
                  rounded-md
                  border
                  border-border
                  bg-muted/60
                  px-2
                  py-0.5
                  font-mono
                  text-[10px]
                  text-muted-foreground
                "
              >
                {pattern}
              </code>
            ))}

          {rule.eventPatterns.length >
            2 && (
            <span className="text-[11px] text-muted-foreground">
              +
              {rule.eventPatterns.length - 2}
              {" "}
              more
            </span>
          )}

        </div>

      </div>

      {/* Provider */}

      <div>

        <Badge
          variant="outline"
          className="uppercase"
        >
          {rule.provider ?? "ANY"}
        </Badge>

      </div>

      {/* Mode */}

      <div>

        <Badge
          variant="secondary"
          className="capitalize"
        >
          {rule.config.mode.replace(
            "_",
            " "
          )}
        </Badge>

      </div>

      {/* Saved */}

      <div>

        <div className="font-semibold">
          {rule.stats.duplicatesSkipped.toLocaleString()}
        </div>

        <div className="text-xs text-muted-foreground">
          duplicate events
        </div>

      </div>

    </button>
  )
}