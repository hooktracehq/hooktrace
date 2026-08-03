"use client";

type Props = {
  events: number;
  connected: boolean;
};

export function StreamStats({
  events,
  connected,
}: Props) {
  const stats = [
    {
      label: "Events",
      value: events.toString(),
    },
    {
      label: "Buffered",
      value: "0",
    },
    {
      label: "Connections",
      value: connected ? "1" : "0",
    },
    {
      label: "Status",
      value: connected ? "Connected" : "Disconnected",
    },
  ];

  return (
    <div className="grid grid-cols-4 border-b border-border">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="
            border-r border-border
            px-5 py-4
            last:border-r-0
          "
        >
          <p className="text-xs text-muted-foreground">
            {stat.label}
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}