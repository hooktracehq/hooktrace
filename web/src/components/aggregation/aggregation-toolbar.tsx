"use client"

import {
  Layers3,
  Plus,
  Search,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Props = {
  query: string
  setQuery: React.Dispatch<
    React.SetStateAction<string>
  >
  totalRules: number
  onCreate: () => void
}

export function AggregationToolbar({
  query,
  setQuery,
  totalRules,
  onCreate,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-background px-6 py-5">

      {/* Left */}
      <div className="flex items-center gap-4">

        <div className="rounded-xl bg-orange-500/10 p-2">
          <Layers3 className="h-5 w-5 text-orange-500" />
        </div>

        <div>

          <div className="flex items-center gap-3">

            <h2 className="text-xl font-semibold">
              Aggregation Rules
            </h2>

            <Badge variant="secondary">
              {totalRules} Rules
            </Badge>

          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Batch, deduplicate and optimize
            high-volume webhook traffic.
          </p>

        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* Search */}

        <div className="relative w-80">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search rules, providers or events..."
            className="
              h-10
              w-full
              rounded-xl
              border
              border-border
              bg-background
              pl-10
              pr-10
              text-sm
              outline-none
              transition-all
              focus:border-orange-500
              focus:ring-2
              focus:ring-orange-500/20
            "
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

        </div>

        {/* Create */}

        <Button
          onClick={onCreate}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Rule
        </Button>

      </div>

    </div>
  )
}