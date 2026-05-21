"use client"

const providers = [
  {
    name: "Stripe",
    value: 42,
    count: "5.2k",
  },

  {
    name: "GitHub",
    value: 24,
    count: "2.1k",
  },

  {
    name: "Shopify",
    value: 18,
    count: "1.2k",
  },

  {
    name: "Discord",
    value: 10,
    count: "842",
  },

  {
    name: "Slack",
    value: 6,
    count: "421",
  },
]

export function ProviderBreakdown() {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-6">

      <div className="mb-6">

        <h2 className="text-lg font-semibold">
          Provider Breakdown
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          event distribution by provider
        </p>

      </div>

      <div className="space-y-5">

        {providers.map((provider) => (
          <div key={provider.name}>

            <div className="mb-2 flex items-center justify-between">

              <div>

                <p className="text-sm font-medium">
                  {provider.name}
                </p>

                <p className="text-xs text-muted-foreground">
                  {provider.count} events
                </p>

              </div>

              <div className="text-sm font-semibold">
                {provider.value}%
              </div>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">

              <div
                className="
                  h-full rounded-full
                  bg-gradient-to-r
                  from-orange-500
                  to-orange-400
                "
                style={{
                  width: `${provider.value}%`,
                }}
              />

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}