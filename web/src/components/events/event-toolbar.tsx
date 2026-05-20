// "use client"

// import {
//   Activity,
//   Search,
//   Wifi,
// } from "lucide-react"

// type Props = {
//   query: string
//   setQuery: (value: string) => void
//   total: number
// }

// export function EventToolbar({
//   query,
//   setQuery,
//   total,
// }: Props) {
//   return (
//     <div className="panel flex h-14 items-center justify-between px-4">

//       {/* Left */}
//       <div className="flex items-center gap-3">

//         <div className="flex items-center gap-2">
//           <Activity className="h-4 w-4 text-primary" />

//           <h1 className="text-sm font-semibold">
//             Event Workspace
//           </h1>
//         </div>

//         <div className="h-4 w-px bg-border" />

//         <span className="text-xs text-muted-foreground">
//           {total} events
//         </span>
//       </div>

//       {/* Right */}
//       <div className="flex items-center gap-3">

//         {/* Search */}
//         <div className="flex h-9 w-[280px] items-center gap-2 rounded-lg border border-border bg-surface-1 px-3">

//           <Search className="h-4 w-4 text-muted-foreground" />

//           <input
//             value={query}
//             onChange={(e) =>
//               setQuery(e.target.value)
//             }
//             placeholder="Search events..."
//             className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
//           />
//         </div>

//         {/* Realtime */}
//         <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-2">

//           <Wifi className="h-3.5 w-3.5 text-live" />

//           <span className="text-xs text-muted-foreground">
//             Live
//           </span>
//         </div>
//       </div>
//     </div>
//   )
// }


"use client"

import {
  Pause,
  Play,
  Search,
  Wifi,
  Funnel
} from "lucide-react"

import { useEventsStore } from "@/app/stores/events-store"

type Props = {
  count: number

  query: string
  setQuery: React.Dispatch<
    React.SetStateAction<string>
  >

  status: string
  setStatus: React.Dispatch<
    React.SetStateAction<string>
  >

  provider: string
  setProvider: React.Dispatch<
    React.SetStateAction<string>
  >
}

export function EventToolbar({
  count,
  query,
  setQuery,
  status,
  setStatus,
  provider,
  setProvider,
}: Props) {
  const paused =
    useEventsStore(
      (s) => s.paused
    )

  const connected =
    useEventsStore(
      (s) => s.connected
    )

  const togglePause =
    useEventsStore(
      (s) => s.togglePause
    )

  return (
    <div className="flex items-center justify-between px-5 py-3">

      {/* Left */}
      <div className="flex items-center gap-4">

        <div className="flex items-center gap-2">

          <div className="h-2 w-2 rounded-full bg-primary" />

          <h2 className="text-sm font-semibold text-foreground">
            Event Workspace
          </h2>

        </div>

        <span className="text-xs text-muted-foreground">
          {count} events
        </span>

      </div>

      {/* Right */}

      {/* Status Filter */}
<select
  value={status}
  onChange={(e) =>
    setStatus(e.target.value)
  }
  className="
    rounded-lg border border-border
    bg-surface-1 px-3 py-2
    text-sm text-foreground
    outline-none
  "
>
  <option value="">
    All Status
  </option>

  <option value="delivered">
    Delivered
  </option>

  <option value="failed">
    Failed
  </option>

  <option value="pending">
    Pending
  </option>

  <option value="retrying">
    Retrying
  </option>
</select>

{/* Provider Filter */}
<select
  value={provider}
  onChange={(e) =>
    setProvider(e.target.value)
  }
  className="
    rounded-lg border border-border
    bg-surface-1 px-3 py-2
    text-sm text-foreground
    outline-none
  "
>
  <option value="">
    All Providers
  </option>

  <option value="github">
    GitHub
  </option>

  <option value="stripe">
    Stripe
  </option>

  <option value="slack">
    Slack
  </option>

  <option value="discord">
    Discord
  </option>

  <option value="notion">
    Notion
  </option>
</select>
      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-2">

          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search events..."
            className="
              bg-transparent
              text-sm
              text-foreground
              outline-none
              placeholder:text-muted-foreground
            "
          />

        </div>

        {/* Connection */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-2">

          <Wifi
            className={`h-4 w-4 ${
              connected
                ? "text-live"
                : "text-destructive"
            }`}
          />

          <span className="text-sm text-muted-foreground">
            {connected
              ? "Live"
              : "Offline"}
          </span>

        </div>

        {/* Pause */}
        <button
          onClick={togglePause}
          className="
            flex items-center gap-2
            rounded-lg border border-border
            bg-surface-1
            px-3 py-2
            text-sm text-muted-foreground
            transition-colors
            hover:bg-accent
            hover:text-accent-foreground
          "
        >
          {paused ? (
            <>
              <Play className="h-4 w-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          )}
        </button>

      </div>
    </div>
  )
}