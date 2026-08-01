"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { ChartCard } from "@/components/metrics/ChartCard";
import { ChartTooltip } from "@/components/metrics/ChartTooltip";
import { ChartLegend } from "@/components/metrics/ChartLegend";
import { ChartEmpty } from "@/components/metrics/ChartEmpty";

type Props = {
  data: {
    name: string;
    value: number;
  }[];
};

const COLORS = [
  "#f97316",
  "#22c55e",
  "#3b82f6",
  "#e11d48",
  "#a855f7",
];

export function ProviderDistribution({
  data,
}: Props) {
  if (!data.length) {
    return (
      <ChartCard
        title="Provider Distribution"
        description="Webhook traffic by provider"
      >
        <ChartEmpty />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Provider Distribution"
      description="Webhook traffic by provider"
    >
      <div className="grid grid-cols-[1fr_180px] gap-6">
        <div className="h-[320px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[
                        index % COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

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
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center">
          <ChartLegend
            items={data.map(
              (provider, index) => ({
                label: provider.name,
                value: provider.value,
                color:
                  COLORS[
                    index %
                      COLORS.length
                  ],
              })
            )}
          />
        </div>
      </div>
    </ChartCard>
  );
}