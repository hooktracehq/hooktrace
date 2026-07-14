"use client"

import { useMemo, useState } from "react"

import {
  Filter,
  Inbox,
  Search,
} from "lucide-react"

import { TunnelRequestDetails } from "./tunnel-request-details"
import { TunnelRequestRow } from "./tunnel-request-row"

import type { TunnelLog } from "@/types/tunnel"

type Props = {
  logs: TunnelLog[]
  loading?: boolean
}

export function TunnelRequestTable({
  logs,
  loading = false,
}: Props) {
  const [expanded, setExpanded] =
    useState<string | null>(null)

  const [search, setSearch] =
    useState("")

  const [statusFilter, setStatusFilter] =
    useState<
      "all" |
      "success" |
      "client" |
      "server"
    >("all")

  const filteredLogs = useMemo(() => {

    return logs.filter((log) => {

      const matchesSearch =
        log.path
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        log.method
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesStatus =

        statusFilter === "all"

          ? true

          : statusFilter === "success"

          ? log.statusCode >= 200 &&
            log.statusCode < 300

          : statusFilter === "client"

          ? log.statusCode >= 400 &&
            log.statusCode < 500

          : log.statusCode >= 500

      return (
        matchesSearch &&
        matchesStatus
      )

    })

  }, [
    logs,
    search,
    statusFilter,
  ])

  if (loading) {
    return (
      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-card
        "
      >
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-16
              animate-pulse
              border-b
              border-border
              bg-muted/30
              last:border-none
            "
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
      "
    >

      {/* Toolbar */}

      <div
        className="
          flex
          flex-col
          gap-4
          border-b
          border-border
          p-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div>

          <h2 className="text-lg font-semibold">
            Live Requests
          </h2>

          <p className="text-sm text-muted-foreground">
            Every request forwarded through this tunnel appears here in real time.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <div className="relative">

            <Search
              className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value,
                )
              }
              placeholder="Search path or method..."
              className="
                w-64
                rounded-lg
                border
                border-border
                bg-background
                py-2
                pl-10
                pr-4
                text-sm
                outline-none
                focus:ring-2
                focus:ring-orange-500
              "
            />

          </div>

          <div className="relative">

            <Filter
              className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | "success"
                    | "client"
                    | "server",
                )
              }
              className="
                rounded-lg
                border
                border-border
                bg-background
                py-2
                pl-10
                pr-4
                text-sm
                outline-none
                focus:ring-2
                focus:ring-orange-500
              "
            >
              <option value="all">
                All Requests
              </option>

              <option value="success">
                2xx Success
              </option>

              <option value="client">
                4xx Client Error
              </option>

              <option value="server">
                5xx Server Error
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* Empty */}

      {filteredLogs.length === 0 ? (

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            py-20
          "
        >

          <Inbox
            className="
              mb-4
              h-10
              w-10
              text-muted-foreground
            "
          />

          <h3 className="font-semibold">
            No requests yet
          </h3>

          <p
            className="
              mt-2
              max-w-md
              text-center
              text-sm
              text-muted-foreground
            "
          >
            Once webhooks start flowing through this tunnel,
            every request will appear here instantly.
          </p>

        </div>

      ) : (

        filteredLogs.map((log) => (

          <div key={log.id}>

            <TunnelRequestRow
              request={log}
              expanded={
                expanded === log.id
              }
              onClick={() =>
                setExpanded(
                  expanded === log.id
                    ? null
                    : log.id,
                )
              }
            />

            {expanded === log.id && (

              <TunnelRequestDetails
                request={log}
              />

            )}

          </div>

        ))

      )}

    </div>
  )
}