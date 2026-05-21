"use client"

import {
  CheckCircle2,
  Database,
  Server,
  Wifi,
} from "lucide-react"

const services = [
  {
    name: "Ingress Gateway",
    status: "healthy",
    latency: "12ms",
    icon: Wifi,
  },

  {
    name: "Redis Queue",
    status: "healthy",
    latency: "4ms",
    icon: Database,
  },

  {
    name: "Delivery Workers",
    status: "healthy",
    latency: "18ms",
    icon: Server,
  },
]

export function InfraHealth() {
  return (
    <div
      className="
        rounded-2xl border border-border
        bg-surface-1 p-6
      "
    >

      <div className="mb-6">

        <h2 className="text-lg font-semibold">
          Infrastructure Health
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          realtime system availability
        </p>

      </div>

      <div className="space-y-4">

        {services.map((service) => {
          const Icon = service.icon

          return (
            <div
              key={service.name}
              className="
                flex items-center justify-between
                rounded-xl border border-border
                bg-background/30
                p-4
              "
            >

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
                    {service.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    latency {service.latency}
                  </p>

                </div>

              </div>

              <div
                className="
                  flex items-center gap-2
                  rounded-full
                  border border-emerald-500/20
                  bg-emerald-500/10
                  px-3 py-1
                  text-xs font-medium
                  text-emerald-400
                "
              >

                <CheckCircle2 className="h-3.5 w-3.5" />

                healthy

              </div>

            </div>
          )
        })}

      </div>
    </div>
  )
}