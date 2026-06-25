"use client"

import {
  PlugZap,
  Search,
} from "lucide-react"

type Props = {
  query: string
  setQuery: React.Dispatch<
    React.SetStateAction<string>
  >
}

export function ConnectionsToolbar({
  query,
  setQuery,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">

      <div className="flex items-center gap-3">

        <PlugZap className="h-5 w-5 text-orange-400" />

        <div>

          <h2 className="text-xl font-semibold">
            Connections
          </h2>

          <p className="text-sm text-muted-foreground">
            provider integrations
          </p>

        </div>

      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">

        <Search className="h-4 w-4 text-muted-foreground" />

        <input
          value={query}
          onChange={(e) =>
            setQuery(
              e.target.value
            )
          }
          placeholder="Search providers..."
          className="bg-transparent outline-none"
        />

      </div>

    </div>
  )
}