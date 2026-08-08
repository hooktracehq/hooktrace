"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { ReplayToolbar } from "./replay-toolbar"
import { ReplayStats } from "./replay-stats"
import { ReplayStream } from "./replay-stream"
import { ReplayInspector } from "./replay-inspector"

import type { Replay } from "@/types/replay-types"


export function ReplayWorkspace() {
  const [query, setQuery] = useState("")

  const [replays, setReplays] =
    useState<Replay[]>([])

  const [selected, setSelected] =
    useState<Replay | null>(null)

  const [loading, setLoading] =
    useState(true)


  // =====================================================
  // LOAD REPLAYS
  // =====================================================

  const loadReplays = useCallback(
    async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/replays",
          {
            credentials: "include",
          }
        )

        if (!response.ok) {
          throw new Error(
            "Failed to load replays"
          )
        }

        const data: Replay[] =
          await response.json()

        setReplays(data)

        // Keep current selection if it
        // still exists.
        setSelected((current) => {
          if (!data.length) {
            return null
          }

          if (!current) {
            return data[0]
          }

          const updatedSelected =
            data.find(
              (item) =>
                item.id === current.id
            )

          return (
            updatedSelected ??
            data[0]
          )
        })

      } catch (error) {

        console.error(
          "Failed to load replays:",
          error
        )

      } finally {

        setLoading(false)
      }
    },
    []
  )


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadReplays()
  }, [loadReplays])


  // =====================================================
  // SEARCH
  // =====================================================

  const filtered = useMemo(() => {

    const normalizedQuery =
      query
        .toLowerCase()
        .trim()

    if (!normalizedQuery) {
      return replays
    }

    return replays.filter(
      (item) =>
        `
          ${item.provider}
          ${item.event_type}
          ${item.status}
          ${item.id}
          ${item.event_id}
        `
          .toLowerCase()
          .includes(
            normalizedQuery
          )
    )

  }, [
    replays,
    query,
  ])


  // =====================================================
  // STATS
  // =====================================================

  const stats = useMemo(() => {

    return {
      queued: replays.reduce(
        (sum, item) =>
          sum +
          (item.queued_events || 0),
        0
      ),

      running: replays.reduce(
        (sum, item) =>
          sum +
          (item.running_events || 0),
        0
      ),

      completed: replays.reduce(
        (sum, item) =>
          sum +
          (item.completed_events || 0),
        0
      ),

      failed: replays.reduce(
        (sum, item) =>
          sum +
          (item.failed_events || 0),
        0
      ),
    }

  }, [replays])


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="
        flex
        h-[calc(100vh-92px)]
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-surface-1
      "
    >

      {/* ================================================
          TOOLBAR
      ================================================= */}

      <ReplayToolbar
        query={query}
        setQuery={setQuery}
        onReplayCreated={loadReplays}
      />


      {/* ================================================
          STATS
      ================================================= */}

      <ReplayStats
        stats={stats}
      />


      {/* ================================================
          WORKSPACE
      ================================================= */}

      <PanelGroup
        direction="horizontal"
      >

        {/* ==============================================
            REPLAY LIST
        =============================================== */}

        <Panel
          defaultSize={68}
          minSize={45}
        >

          {loading ? (

            <div
              className="
                flex
                h-full
                items-center
                justify-center
                text-sm
                text-muted-foreground
              "
            >
              Loading replays...
            </div>

          ) : filtered.length === 0 ? (

            <div
              className="
                flex
                h-full
                items-center
                justify-center
                text-sm
                text-muted-foreground
              "
            >
              No replays found
            </div>

          ) : (

            <ReplayStream
              replays={filtered}
              selected={selected}
              onSelect={setSelected}
            />

          )}

        </Panel>


        {/* ==============================================
            RESIZE HANDLE
        =============================================== */}

        <PanelResizeHandle
          className="
            w-2
            bg-border/40
            transition-colors
            hover:bg-orange-500/20
          "
        />


        {/* ==============================================
            INSPECTOR
        =============================================== */}

        <Panel
          defaultSize={32}
          minSize={24}
        >

          <div
            className="
              h-full
              border-l
              border-border
              bg-background/20
            "
          >

            <ReplayInspector
              replay={selected}
              onReplayCreated={loadReplays}
            />

          </div>

        </Panel>

      </PanelGroup>

    </div>
  )
}