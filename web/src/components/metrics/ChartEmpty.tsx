"use client";

import { Activity } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
};

export function ChartEmpty({
  title = "No data available",
  description = "Webhook traffic will appear here once events are received.",
}: Props) {
  return (
    <div
      className="
      flex
      h-[320px]
      flex-col
      items-center
      justify-center
      text-center
    "
    >
      <Activity
        className="
        mb-4
        h-10
        w-10
        text-muted-foreground
      "
      />

      <h3 className="font-medium">
        {title}
      </h3>

      <p
        className="
        mt-2
        max-w-xs
        text-sm
        text-muted-foreground
      "
      >
        {description}
      </p>
    </div>
  );
}