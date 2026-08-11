// "use client"

// type DashboardProvider = {
//   name: string
//   count: number
//   percentage: number
// }

// type Props = {
//   providers?: DashboardProvider[] | null
// }

// export function ProviderBreakdown({
//   providers = [],
// }: Props) {
//   const safeProviders = Array.isArray(providers)
//     ? providers
//     : []

//   return (
//     <div className="rounded-2xl border border-border bg-surface-1 p-6">
//       <div className="mb-6">
//         <h2 className="text-lg font-semibold">
//           Provider Breakdown
//         </h2>

//         <p className="mt-1 text-sm text-muted-foreground">
//           Event distribution by provider
//         </p>
//       </div>

//       {safeProviders.length === 0 ? (
//         <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border">
//           <div className="text-center">
//             <p className="text-sm font-medium">
//               No provider data yet
//             </p>

//             <p className="mt-1 text-xs text-muted-foreground">
//               Provider distribution will appear as events arrive.
//             </p>
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-5">
//           {safeProviders.slice(0, 6).map((provider) => {
//             const percentage = Math.min(
//               Math.max(Number(provider.percentage) || 0, 0),
//               100
//             )

//             return (
//               <div key={provider.name}>
//                 <div className="mb-2 flex items-center justify-between gap-4">
//                   <div className="min-w-0">
//                     <p className="truncate text-sm font-medium capitalize">
//                       {provider.name}
//                     </p>

//                     <p className="text-xs text-muted-foreground">
//                       {Number(provider.count || 0).toLocaleString()} events
//                     </p>
//                   </div>

//                   <div className="shrink-0 text-sm font-semibold tabular-nums">
//                     {percentage.toFixed(1)}%
//                   </div>
//                 </div>

//                 <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
//                   <div
//                     className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
//                     style={{
//                       width: `${percentage}%`,
//                     }}
//                   />
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }




"use client"

type DashboardProvider = {
  name: string
  count: number
  percentage: number
}

type Props = {
  providers?: DashboardProvider[] | null
}

export function ProviderBreakdown({
  providers = [],
}: Props) {
  const safeProviders = Array.isArray(providers)
    ? providers
    : []

  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Provider Breakdown
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Event distribution by provider
        </p>
      </div>

      {safeProviders.length === 0 ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-border">
          <div className="text-center">
            <p className="text-sm font-medium">
              No provider data yet
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Provider distribution will appear as events arrive.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {safeProviders.slice(0, 6).map((provider) => {
            const percentage = Math.min(
              Math.max(Number(provider.percentage) || 0, 0),
              100
            )

            return (
              <div key={provider.name}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium capitalize">
                      {provider.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {Number(provider.count || 0).toLocaleString()} events
                    </p>
                  </div>

                  <div className="shrink-0 text-sm font-semibold tabular-nums">
                    {percentage.toFixed(1)}%
                  </div>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-white/[0.04]"
                  role="progressbar"
                  aria-label={`${provider.name} share of events`}
                  aria-valuenow={Math.round(percentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}