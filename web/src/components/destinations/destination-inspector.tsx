"use client"

import { useState } from "react"

import { Send } from "lucide-react"

import type { Destination } from "@/types/destinations"

import EditTargetModal from "@/components/delivery-targets/EditTargetModal"
import DeleteTargetDialog from "./DeleteTargetDialog"
import TestTargetButton from "./TestTargetButton"
import DestinationLogs from "./DestinationLogs"
import InsightsPanel from "@/components/delivery-targets/InsightsPanel"

import {
  useDestinationLogs,
} from "@/hooks/destinations/use-destination-logs"

type Props = {
  destination: Destination | null

  onUpdated: (target: Destination) => void

  onDeleted: (id: string) => void
}

export function DestinationInspector({
  destination,
  onUpdated,
  onDeleted,
}: Props) {
  const [tab, setTab] = useState<
    "overview" | "logs" | "insights"
  >("overview")
  
    const {
      data,
      isLoading,
    } = useDestinationLogs(destination?.id)
  
    const logs = data?.items ?? []

  if (!destination) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a destination
      </div>
    )
  }

  const endpoint =
    (destination.config.url as string) ??
    (destination.config.webhookUrl as string) ??
    "-"

  return (
    <div className="flex h-full flex-col">

      {/* Header */}

      <div className="border-b border-border p-5">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <Send className="h-5 w-5 text-orange-400" />

            <div>

              <h2 className="font-semibold">
                Destination Inspector
              </h2>

              <p className="text-sm text-muted-foreground">
                Endpoint details
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <TestTargetButton
              targetId={destination.id}
            />

            <EditTargetModal
              target={destination}
              onUpdated={onUpdated}
            />

            <DeleteTargetDialog
              target={destination}
              onDeleted={onDeleted}
            />

          </div>

        </div>

      </div>

      {/* Tabs */}

      <div className="flex border-b border-border">

        {[
          "overview",
          "logs",
          "insights",
        ].map((item) => (

          <button
            key={item}
            onClick={() =>
              setTab(
                item as
                  | "overview"
                  | "logs"
                  | "insights"
              )
            }
            className={`px-5 py-3 text-sm capitalize transition ${
              tab === item
                ? "border-b-2 border-orange-500 font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item}
          </button>

        ))}

      </div>

      {/* Content */}

      <div className="flex-1 overflow-y-auto">

        {tab === "overview" && (

          <>
            <div className="space-y-4 p-5 text-sm">

              <Info
                label="Name"
                value={destination.name}
              />

              <Info
                label="Type"
                value={destination.type}
              />

              <Info
                label="Status"
                value={
                  destination.enabled
                    ? "Healthy"
                    : "Paused"
                }
              />

              <Info
                label="Success"
                value={destination.successCount}
              />

              <Info
                label="Errors"
                value={destination.errorCount}
              />

              <div>

                <p className="mb-2 text-xs text-muted-foreground">
                  Providers
                </p>

                <div className="flex flex-wrap gap-2">

                  {destination.providers.length === 0 ? (

                    <span className="rounded-full border px-2 py-1 text-xs">
                      All Providers
                    </span>

                  ) : (

                    destination.providers.map((provider) => (

                      <span
                        key={provider}
                        className="rounded-full border px-2 py-1 text-xs"
                      >
                        {provider}
                      </span>

                    ))

                  )}

                </div>

              </div>

              <Info
                label="Created"
                value={new Date(
                  destination.createdAt
                ).toLocaleString()}
              />

              <Info
                label="Last Used"
                value={
                  destination.lastUsed
                    ? new Date(
                        destination.lastUsed
                      ).toLocaleString()
                    : "Never"
                }
              />

            </div>

            <div className="border-t border-border p-5">

              <h3 className="mb-4 font-medium">
                Configuration
              </h3>

              <div className="space-y-3">

                {destination.config.url && (
                  <Info
                    label="URL"
                    value={destination.config.url}
                  />
                )}

                {destination.config.method && (
                  <Info
                    label="Method"
                    value={destination.config.method}
                  />
                )}

                {destination.config.timeout && (
                  <Info
                    label="Timeout"
                    value={`${destination.config.timeout} ms`}
                  />
                )}

                {destination.config.retries !==
                  undefined && (
                  <Info
                    label="Retries"
                    value={destination.config.retries}
                  />
                )}

                <div>

                  <p className="mb-2 text-xs text-muted-foreground">
                    Endpoint
                  </p>

                  <div className="rounded-xl border border-border p-3 text-xs break-all">
                    {endpoint}
                  </div>

                </div>

              </div>

            </div>
          </>

        )}

        {tab === "logs" && (

          <div className="p-5">

            {isLoading ? (

              <div className="text-sm text-muted-foreground">
                Loading logs...
              </div>

            ) : (

              <DestinationLogs logs={logs} />

            )}

          </div>

        )}

        {tab === "insights" && (

          <div className="p-5">

            {isLoading ? (

              <div className="text-sm text-muted-foreground">
                Calculating insights...
              </div>

            ) : (

              <InsightsPanel
                logs={logs}
              />

            )}

          </div>

        )}

      </div>

    </div>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">

      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="max-w-[60%] break-all text-right">
        {value}
      </span>

    </div>
  )
}