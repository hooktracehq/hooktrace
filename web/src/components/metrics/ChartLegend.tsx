"use client";

type Item = {
  label: string;
  value: number | string;
  color: string;
};

type Props = {
  items: Item[];
};

export function ChartLegend({
  items,
}: Props) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="
          flex
          items-center
          justify-between
        "
        >
          <div className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: item.color,
              }}
            />

            <span className="text-sm">
              {item.label}
            </span>
          </div>

          <span className="font-semibold">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}