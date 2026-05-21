"use client"

import {
  Cpu,
  HardDrive,
  MemoryStick,
  Workflow,
} from "lucide-react"

const stats = [
  {
    label: "CPU Usage",
    value: "22%",
    icon: Cpu,
  },

  {
    label: "Memory",
    value: "3.2GB",
    icon: MemoryStick,
  },

  {
    label: "Queue Depth",
    value: "182",
    icon: Workflow,
  },

  {
    label: "Storage",
    value: "68%",
    icon: HardDrive,
  },
]

export function SystemStatus() {
  return (
    <div
      className="
        rounded-2xl border border-border
        bg-surface-1 p-6
      "
    >

      <div className="mb-6">

        <h2 className="text-lg font-semibold">
          System Status
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          workers, queues & resources
        </p>

      </div>

      <div className="grid gap-4">

        {stats.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              className="
                rounded-xl border border-border
                bg-background/20
                p-4
              "
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex h-10 w-10 items-center justify-center
                      rounded-xl border border-border
                      bg-background/40
                    "
                  >
                    <Icon className="h-5 w-5 text-orange-400" />
                  </div>

                  <div>

                    <p className="text-sm font-medium">
                      {item.label}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      realtime telemetry
                    </p>

                  </div>

                </div>

                <div className="text-xl font-semibold">
                  {item.value}
                </div>

              </div>

            </div>
          )
        })}

      </div>
    </div>
  )
}