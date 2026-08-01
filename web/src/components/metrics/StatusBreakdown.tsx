"use client";

import {
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Clock3,
} from "lucide-react";

type Props = {
  delivered: number;
  failed: number;
  retried: number;
  pending?: number;
};

function StatusRow({
  icon: Icon,
  label,
  value,
  color,
  percent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  percent: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon
            className={`h-4 w-4 ${color}`}
          />

          <span className="text-sm">
            {label}
          </span>
        </div>

        <div className="text-sm font-semibold">
          {value}
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color.replace(
            "text",
            "bg"
          )}`}
          style={{
            width: `${percent}%`,
          }}
        />
      </div>

      <div className="text-right text-xs text-muted-foreground">
        {percent.toFixed(1)}%
      </div>
    </div>
  );
}

export function StatusBreakdown({
  delivered,
  failed,
  retried,
  pending = 0,
}: Props) {
  const total =
    delivered +
    failed +
    retried +
    pending;

  return (
    <div className="rounded-2xl border border-border/60 bg-surface-1 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Delivery Status
        </h2>

        <p className="text-sm text-muted-foreground">
          Webhook delivery health
        </p>
      </div>

      <div className="space-y-6">
        <StatusRow
          icon={CheckCircle2}
          label="Delivered"
          value={delivered}
          color="text-emerald-500"
          percent={
            total
              ? (delivered / total) * 100
              : 0
          }
        />

        <StatusRow
          icon={RotateCcw}
          label="Retried"
          value={retried}
          color="text-amber-500"
          percent={
            total
              ? (retried / total) * 100
              : 0
          }
        />

        <StatusRow
          icon={AlertTriangle}
          label="Failed"
          value={failed}
          color="text-red-500"
          percent={
            total
              ? (failed / total) * 100
              : 0
          }
        />

        <StatusRow
          icon={Clock3}
          label="Pending"
          value={pending}
          color="text-sky-500"
          percent={
            total
              ? (pending / total) * 100
              : 0
          }
        />
      </div>
    </div>
  );
}