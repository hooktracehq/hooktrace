"use client"

import Link from "next/link"
import {
  Plus,
  Route as RouteIcon,
  Search,
} from "lucide-react"

type Props = {
  query: string
  setQuery: React.Dispatch<
    React.SetStateAction<string>
  >
}

export function RoutesToolbar({
  query,
  setQuery,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      <div className="flex items-center gap-3">
        <RouteIcon className="h-5 w-5 text-orange-400" />

        <div>
          <h2 className="text-xl font-semibold">
            Routes Explorer
          </h2>

          <p className="text-sm text-muted-foreground">
            Manage your webhook ingress routes
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search routes..."
            className="
              w-52
              bg-transparent
              text-sm
              outline-none
              placeholder:text-muted-foreground
            "
          />
        </div>

        <Link
          href="/routes/new"
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
          Create Route
        </Link>
      </div>
    </div>
  )
}