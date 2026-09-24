"use client"

import {
  PlugZap,
  Search,
  Plus,
} from "lucide-react"

type Props = {
  query: string
  setQuery: React.Dispatch<
    React.SetStateAction<string>
  >
  onConnect: () => void
}

export function ConnectionsToolbar({
  query,
  setQuery,
  onConnect,
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
            Create and manage provider webhook endpoints
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search providers..."
            className="
              w-52
              bg-transparent
              text-sm
              outline-none
              placeholder:text-muted-foreground
            "
          />
        </div>

        <button
          type="button"
          onClick={onConnect}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-primary
            px-4
            py-2
            text-sm
            font-medium
            text-primary-foreground
            transition-colors
            hover:bg-primary/90
          "
        >
          <Plus className="h-4 w-4" />
          Connect Provider
        </button>
      </div>
    </div>
  )
}