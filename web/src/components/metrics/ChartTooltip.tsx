"use client";

import type { TooltipContentProps } from "recharts";

export function ChartTooltip(
  props: TooltipContentProps<number, string>
) {
  const {
    active,
    payload,
    label,
  } = props;

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="
        min-w-[160px]
        rounded-xl
        border border-border
        bg-background/95
        p-4
        shadow-2xl
        backdrop-blur
      "
    >
      {label && (
        <p className="mb-2 text-xs text-muted-foreground">
          {String(label)}
        </p>
      )}

      {payload.map((item, index) => (
        <div
          key={`${item.dataKey}-${index}`}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: item.color,
              }}
            />

            <span className="text-sm">
              {item.name}
            </span>
          </div>

          <span className="font-semibold">
            {typeof item.value === "number"
              ? item.value.toFixed(3)
              : String(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}