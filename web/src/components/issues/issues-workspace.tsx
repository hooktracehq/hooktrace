// "use client"

// import { useMemo, useState } from "react"
// import { useQueryClient } from "@tanstack/react-query"

// import {
//   Panel,
//   PanelGroup,
//   PanelResizeHandle,
// } from "react-resizable-panels"

// import { IssuesToolbar } from "./issues-toolbar"
// import { IssueStats } from "./issue-stats"
// import { IssueStream } from "./issue-stream"
// import { IssueInspector } from "./issue-inspector"

// import { useOperationalIssues } from "@/hooks/issues/useOperationalIssues"

// import type { Event } from "@/types/event"

// export function IssuesWorkspace() {
//   const queryClient = useQueryClient()

//   const {
//     data,
//     isLoading,
//   } = useOperationalIssues()

//   const [query, setQuery] = useState("")
//   const [selected, setSelected] = useState<Event | null>(null)

//   const issues = data?.items ?? []

//   const filtered = useMemo(() => {
//     const search = query.trim().toLowerCase()

//     if (!search) return issues

//     return issues.filter((issue) =>
//       [
//         issue.provider,
//         issue.route,
//         issue.event_type,
//         issue.last_error,
//       ]
//         .join(" ")
//         .toLowerCase()
//         .includes(search)
//     )
//   }, [issues, query])

//   async function handleReplayComplete() {
//     /*
//      * The replay has been accepted by the backend.
//      *
//      * The selected event is no longer a DLQ issue,
//      * so don't keep showing its old DLQ state in the inspector.
//      */
//     setSelected(null)

//     /*
//      * Refresh both the issue list and the statistics.
//      */
//     await Promise.all([
//       queryClient.invalidateQueries({
//         queryKey: ["issues"],
//       }),

//       queryClient.invalidateQueries({
//         queryKey: ["issue-stats"],
//       }),
//     ])
//   }

//   return (
//     <div
//       className="
//         flex
//         h-[calc(100vh-92px)]
//         flex-col
//         overflow-hidden
//         rounded-2xl
//         border border-border
//         bg-surface-1
//       "
//     >
//       <IssuesToolbar
//         query={query}
//         setQuery={setQuery}
//         selected={selected}
//         onReplayComplete={handleReplayComplete}
//       />

//       <IssueStats />

//       <PanelGroup direction="horizontal">

//         <Panel
//           defaultSize={68}
//           minSize={45}
//         >
//           <IssueStream
//             issues={filtered}
//             selected={selected}
//             onSelect={setSelected}
//             loading={isLoading}
//           />
//         </Panel>

//         <PanelResizeHandle className="w-2 bg-border/40" />

//         <Panel
//           defaultSize={32}
//           minSize={24}
//         >
//           <div className="h-full border-l border-border bg-background/20">
//             <IssueInspector
//               issue={selected}
//             />
//           </div>
//         </Panel>

//       </PanelGroup>
//     </div>
//   )
// }




"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { IssuesToolbar } from "@/components/issues/issues-toolbar"
import { IssueStats } from "@/components/issues/issue-stats"
import { IssueStream } from "@/components/issues/issue-stream"
import { IssueInspector } from "@/components/issues/issue-inspector"

import { useDlq } from "@/hooks/events/useDlq"

import type { Event } from "@/types/event"

export default function IssuesWorkspace() {
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
  } = useDlq()

  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Event | null>(null)

  const issues = data?.items ?? []

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()

    if (!search) return issues

    return issues.filter((issue) =>
      [
        issue.provider,
        issue.route,
        issue.last_error,
        issue.event_type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    )
  }, [issues, query])

  async function handleReplayComplete() {
    // The selected event has left the DLQ flow.
    setSelected(null)

    // Refresh the DLQ list.
    await queryClient.invalidateQueries({
      queryKey: ["events", "dlq"],
    })

    // Refresh the issue statistics.
    await queryClient.invalidateQueries({
      queryKey: ["issue-stats"],
    })
  }

  return (
    <div
      className="
        flex
        h-[calc(100vh-92px)]
        flex-col
        overflow-hidden
        rounded-2xl
        border border-border
        bg-surface-1
      "
    >
      <IssuesToolbar
        query={query}
        setQuery={setQuery}
        selected={selected}
        onReplayComplete={handleReplayComplete}
      />

      <IssueStats />

      <PanelGroup direction="horizontal">
        <Panel
          defaultSize={68}
          minSize={45}
        >
          <IssueStream
            issues={filtered}
            selected={selected}
            onSelect={setSelected}
            loading={isLoading}
          />
        </Panel>

        <PanelResizeHandle className="w-2 bg-border/40" />

        <Panel
          defaultSize={32}
          minSize={24}
        >
          <div className="h-full border-l border-border bg-background/20">
            <IssueInspector issue={selected} />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}