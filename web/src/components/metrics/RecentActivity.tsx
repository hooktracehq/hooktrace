"use client";

import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock3,
} from "lucide-react";

type Activity = {
  id: number;
  provider: string;
  event: string;
  status: string;
  latency: number;
  time: string;
};

type Props = {
  items: Activity[];
};

function StatusIcon({
  status,
}: {
  status: string;
}) {
  switch (status) {
    case "delivered":
      return (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      );

    case "failed":
      return (
        <AlertTriangle className="h-4 w-4 text-red-500" />
      );

    case "retried":
      return (
        <RotateCcw className="h-4 w-4 text-amber-500" />
      );

    default:
      return (
        <Clock3 className="h-4 w-4 text-sky-500" />
      );
  }
}

export function RecentActivity({
  items,
}: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-1 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Recent Activity
        </h2>

        <p className="text-sm text-muted-foreground">
          Latest webhook deliveries
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">
                Provider
              </th>

              <th className="px-4 py-3 text-left">
                Event
              </th>

              <th className="px-4 py-3 text-left">
                Status
              </th>

              <th className="px-4 py-3 text-left">
                Latency
              </th>

              <th className="px-4 py-3 text-left">
                Time
              </th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground"
                >
                  No recent webhook activity
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-4 font-medium capitalize">
                    {item.provider}
                  </td>

                  <td className="px-4 py-4">
                    {item.event}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon
                        status={item.status}
                      />

                      <span className="capitalize">
                        {item.status}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {item.latency > 0
                      ? `${Math.round(
                          item.latency * 1000
                        )} ms`
                      : "--"}
                  </td>

                  <td className="px-4 py-4 text-muted-foreground">
                    {item.time}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}