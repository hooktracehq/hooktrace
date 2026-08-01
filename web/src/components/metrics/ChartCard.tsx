"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function ChartCard({
  title,
  description,
  children,
  actions,
}: Props) {
  return (
    <div
      className="
      rounded-2xl
      border border-border/60
      bg-surface-1
      p-6
      shadow-sm
      transition-all
      hover:border-primary/20
      hover:shadow-lg
    "
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {actions}
      </div>

      {children}
    </div>
  );
}