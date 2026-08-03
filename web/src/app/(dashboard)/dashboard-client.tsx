"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { useWebhookStream } from "@/hooks/streams/useWebhookStream";

import {
  CheckCircle2,
  AlertTriangle,
  Activity,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";

type Stat = {
  label: string;
  value: number;
};

type Event = {
  id: number;
  provider?: string;
  route?: string;
  token?: string;

  status:
    | "pending"
    | "processing"
    | "retrying"
    | "delivered"
    | "failed"
    | "dlq";

  event_type?: string;

  latency_ms?: number;

  payload?: Record<string, unknown>;

  headers?: Record<string, unknown>;

  created_at: string;

  attempt_count?: number;

  last_error?: string | null;
};

type Endpoint = {
  id: string;
  route: string;
  mode: string;
};

type Integration = {
  id: string;
  name: string;
  provider: string;
};

type User = {
  email: string;
  name?: string;
  avatar_url?: string;
};

export default function DashboardClient({
  stats,
  successSeries,
  failureSeries,
  recentEvents,
  endpoints,
  integrations,
  dlqCount,
  latency,
  user,
}: {
  stats: Stat[];
  successSeries: [number, string][];
  failureSeries: [number, string][];
  recentEvents: Event[];
  endpoints: Endpoint[];
  integrations: Integration[];
  dlqCount: number;
  latency: number;
  user: User;
}) {
  const [isLive, setIsLive] = useState(true);

  const {
    events: liveEvents,
    status,
    connected,
    buffered,
  } = useWebhookStream("/ws/events");

  /* ---------------- Derived ---------------- */

  const incoming =
    stats.find((s) => s.label === "Total Events")?.value ?? 0;

  const delivered =
    stats.find((s) => s.label === "Delivered")?.value ?? 0;

  const failed =
    stats.find((s) => s.label === "Failed")?.value ?? 0;

  const retries =
    stats.find((s) => s.label === "Retries")?.value ?? 0;

  const mergedEvents = [
    ...(isLive ? liveEvents : []),
    ...(recentEvents ?? []),
  ]
    .filter(
      (event, index, array) =>
        array.findIndex((e) => e.id === event.id) === index
    )
    .slice(0, 10);

  const incomingLive =
    incoming + (isLive ? liveEvents.length : 0);

  const deliveredLive =
    delivered +
    (isLive
      ? liveEvents.filter(
          (e) => e.status === "delivered"
        ).length
      : 0);

  const failedLive =
    failed +
    (isLive
      ? liveEvents.filter(
          (e) => e.status === "failed"
        ).length
      : 0);

  const successRate =
    incomingLive > 0
      ? (deliveredLive / incomingLive) * 100
      : 100;

  const isHealthy =
    successRate > 95 && dlqCount === 0;

  const chartData = successSeries.map((s, i) => ({
    time: new Date(s[0] * 1000).toLocaleTimeString(),
    success: Number(s[1]),
    failure: Number(failureSeries[i]?.[1] || 0),
  }));

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">

      {/* NAVBAR */}

      <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Activity className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-lg font-semibold">
                Dashboard
              </h1>

              <p className="text-xs text-muted-foreground">
                Monitor your webhook system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                isLive
                  ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-400"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isLive
                    ? "animate-pulse bg-emerald-400"
                    : "bg-muted-foreground"
                }`}
              />

              {isLive ? "Streaming" : "Paused"}
            </button>

            <span
              className={`rounded px-2 py-1 text-xs ${
                connected
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {status}
            </span>

            <ThemeToggle />

            <UserNav user={user} />
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between rounded-xl border p-4 backdrop-blur-xl ${
            isHealthy
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-400/30 bg-red-500/10 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {isHealthy ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                All systems operational
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Issues detected
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span>{successRate.toFixed(1)}%</span>

            <span>{latency}ms</span>

            <span>{buffered} buffered</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          {[
            {
              label: "Incoming",
              value: incomingLive,
            },
            {
              label: "Delivered",
              value: deliveredLive,
            },
            {
              label: "Failed",
              value: failedLive,
            },
            {
              label: "Retries",
              value: retries,
            },
            {
              label: "Endpoints",
              value: endpoints.length,
            },
            {
              label: "Integrations",
              value: integrations.length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-card/60 p-4 backdrop-blur-xl"
            >
              <p className="text-xs text-muted-foreground">
                {stat.label}
              </p>

              <p className="mt-1 text-xl font-bold">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card/60 p-6 backdrop-blur-xl">
          <h2 className="mb-4 font-semibold">
            Activity
          </h2>

          <div className="h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>
                <XAxis dataKey="time" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="success"
                  stroke="#22c55e"
                />
                <Line
                  type="monotone"
                  dataKey="failure"
                  stroke="#ef4444"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          <div className="rounded-xl border bg-card/60 p-6">
            <h2 className="mb-4 font-semibold">
              Recent Events
            </h2>

            <div className="space-y-2">
              {mergedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex justify-between text-sm"
                >
                  <span>
                    #{event.id} {event.provider}
                  </span>

                  <span className="text-muted-foreground">
                    {new Date(
                      event.created_at
                    ).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card/60 p-6">
            <h2 className="mb-4 font-semibold">
              Endpoints
            </h2>

            <div className="space-y-2 text-sm">
              {endpoints
                .slice(0, 5)
                .map((ep) => (
                  <div
                    key={ep.id}
                    className="flex justify-between"
                  >
                    <span>{ep.route}</span>

                    <span className="text-muted-foreground">
                      {ep.mode}
                    </span>
                  </div>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}