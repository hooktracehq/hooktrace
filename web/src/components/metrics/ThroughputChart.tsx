"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/components/metrics/ChartCard";
import { ChartTooltip } from "@/components/metrics/ChartTooltip";
import { ChartEmpty } from "@/components/metrics/ChartEmpty";

type Props = {
  data: {
    time: string;
    events: number;
  }[];
};

export function ThroughputChart({
  data,
}: Props) {
  return (
    <ChartCard
      title="Webhook Throughput"
      description="Events processed over time"
    >
      {data.length === 0 ? (
        <ChartEmpty />
      ) : (
        <div className="h-[360px]">
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="throughputGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#f97316"
                    stopOpacity={0.35}
                  />

                  <stop
                    offset="95%"
                    stopColor="#f97316"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="2 4"
                stroke="rgba(255,255,255,.05)"
              />

              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888" }}
                tickFormatter={(value, index) =>
                  index % 3 === 0 ? value : ""
                }
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888" }}
              />

              <Tooltip
                content={<ChartTooltip
                    payload={[]}
                    coordinate={undefined}
                    active={false}
                    accessibilityLayer={false}
                    activeIndex={undefined}
                  />
                }
              />

              <Area
                type="monotone"
                dataKey="events"
                stroke="#f97316"
                strokeWidth={3}
                fill="url(#throughputGradient)"
                activeDot={{
                  r: 6,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}