
"use client"

import { motion } from "framer-motion"
import {
  CheckCircle2,
  AlertTriangle,
  Play,
} from "lucide-react"


import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import type { DeliveryTarget, TargetStats } from "@/types/delivery-target"
import EditTargetModal from "@/components/delivery-targets/EditTargetModal"
import TargetLogs from "../target-logs"

/* ---------------- TYPES ---------------- */

type TestResult = {
  success?: boolean
  result?: {
    status_code?: number
    body?: string
    duration_ms?: number
  }
  error?: string
}

/* ---------------- COMPONENT ---------------- */

export default function DeliveryTargetDetailClient({
  target,
  stats,
  user,
}: {
  target: DeliveryTarget
  stats: TargetStats
  user: { email: string; avatar_url?: string }
}) {
  // const { toast } = useToast()
  const router = useRouter()

  const successRate = stats?.successRate || 0
  const isHealthy = successRate >= 95

  const [currentTarget, setCurrentTarget] = useState(target)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  /* ---------------- INLINE EDIT ---------------- */

  const [editMode, setEditMode] = useState(false)

  const [form, setForm] = useState({
    name: target.name,
    config: target.config as Record<string, string>,
  })

  useEffect(() => {
    setForm({
      name: currentTarget.name,
      config: currentTarget.config as Record<string, string>,
    })
  }, [currentTarget])

  async function handleInlineUpdate() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${currentTarget.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            config: form.config,
          }),
        }
      )

      const updated: DeliveryTarget = await res.json()
      setCurrentTarget(updated)
      setEditMode(false)

      toast.success(
        
      "Configuration updated successfully",
      )
    } catch {
      toast.error(
       
         "Failed to update configuration",
       
      )
    }
  }

  /* ---------------- TOGGLE ---------------- */

  async function toggleTarget() {
    setToggling(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${currentTarget.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enabled: !currentTarget.enabled,
          }),
        }
      )

      const updated: DeliveryTarget = await res.json()
      setCurrentTarget(updated)

      toast(
        
         `Target is now ${
          updated.enabled ? "active" : "inactive"
        }`,
      )
    } catch {
      toast.error(
     
         "Failed to update status"
        
      )
    } finally {
      setToggling(false)
    }
  }

  /* ---------------- DELETE ---------------- */

  async function deleteTarget() {
    if (!confirm("Delete this target?")) return

    setDeleting(true)

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${currentTarget.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )

      toast(
        
         "Delivery target removed",
      )

      router.push("/delivery-targets")
    } catch {
      toast.error(
        
         "Failed to delete target",
        
      )
    } finally {
      setDeleting(false)
    }
  }

  /* ---------------- TEST ---------------- */

  async function testTarget() {
    setLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${currentTarget.id}/test`,
        { method: "POST", credentials: "include" }
      )

      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false, error: "Request failed" })
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start">

  <div>
    <h1 className="text-3xl font-bold">{currentTarget.name}</h1>

    <div className="flex gap-2 mt-2 flex-wrap">
      <span className="text-xs px-2 py-1 rounded bg-muted">
        {currentTarget.type}
      </span>

      {currentTarget.providers?.map(p => (
        <span key={p} className="text-xs px-2 py-1 rounded bg-muted">
          {p}
        </span>
      ))}
    </div>
  </div>

  <div className="flex gap-2">
    <button
      onClick={testTarget}
      className="px-3 py-1.5 text-sm border rounded-md"
    >
      Test
    </button>

    <EditTargetModal
      target={currentTarget}
      onUpdated={setCurrentTarget}
    />
  </div>
</div>

        {/* STATUS */}
        <div className={`p-4 rounded-2xl border flex justify-between ${
          isHealthy ? "bg-emerald-50" : "bg-amber-50"
         }`}>
          <div className="flex items-center gap-3">
            {isHealthy ? (
              <CheckCircle2 className="text-emerald-600" />
            ) : (
              <AlertTriangle className="text-amber-600" />
            )}

<div className="flex items-center gap-2 text-sm">
  <div
    className={`w-2 h-2 rounded-full ${
      isHealthy ? "bg-emerald-500" : "bg-amber-500"
    }`}
  />

  <span>
    {isHealthy ? "Healthy" : "Issues detected"} ({successRate}%)
  </span>
</div>
          </div>

          <button
            onClick={testTarget}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 border rounded-md"
          >
            <Play className="w-4 h-4" />
            {loading ? "Testing..." : "Test"}
          </button>


          {result && (
  <div className="rounded-2xl border bg-card p-4 text-sm space-y-2">
    <p className="font-medium">
      {result.success ? "✅ Success" : "❌ Failed"}
    </p>

    {result.result?.status_code && (
      <p>HTTP {result.result.status_code}</p>
    )}

    {result.result?.duration_ms && (
      <p>Latency: {result.result.duration_ms}ms</p>
    )}

    {result.error && (
      <p className="text-red-500">{result.error}</p>
    )}

    {result.result?.body && (
      <details>
        <summary className="cursor-pointer text-muted-foreground">
          View response
        </summary>
        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
          {result.result.body.slice(0, 500)}
        </pre>
      </details>
    )}
  </div>
)}
        </div>

        {/* CONFIG (inline edit stays same) */}
        <div className="rounded-2xl border bg-card p-6 space-y-4">

  <div className="flex justify-between items-center">
    <h2 className="font-semibold">Configuration</h2>

    {!editMode ? (
      <button
        onClick={() => setEditMode(true)}
        className="text-xs border px-2 py-1 rounded"
      >
        Edit
      </button>
    ) : (
      <div className="flex gap-2">
        <button
          onClick={handleInlineUpdate}
          className="text-xs bg-primary text-white px-2 py-1 rounded"
        >
          Save
        </button>
        <button
          onClick={() => setEditMode(false)}
          className="text-xs border px-2 py-1 rounded"
        >
          Cancel
        </button>
      </div>
    )}
  </div>
  {/* PROVIDERS  */}
  <div className="rounded-2xl border bg-card p-6">
  <h2 className="font-semibold mb-4">Providers</h2>

  <div className="flex gap-2 flex-wrap">
    {currentTarget.providers?.length ? (
      currentTarget.providers.map((p) => (
        <span
          key={p}
          className="text-xs px-2 py-1 rounded bg-muted"
        >
          {p}
        </span>
      ))
    ) : (
      <span className="text-xs text-muted-foreground">
        No provider restrictions
      </span>
    )}
  </div>
</div>

{/* Insights */}
        <div className="rounded-2xl border bg-card p-6">
           <h2 className="font-semibold mb-4">Observability Insight</h2>

         <p className="text-sm text-muted-foreground">
             {successRate >= 98
             ? "Delivery pipeline is highly stable with minimal failure rate."             : successRate >= 90
             ? "Minor delivery issues detected. Monitor retry behavior."
              : "Significant failures detected. Check endpoint health."}
           </p>
        </div>

      
  {/* Name */}
  <div>
    <p className="text-xs text-muted-foreground">Name</p>

    {editMode ? (
      <input
        value={form.name}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, name: e.target.value }))
        }
        className="input"
      />
    ) : (
      <p className="text-sm font-medium">{currentTarget.name}</p>
    )}
  </div>

  {/* Config Fields */}
  {Object.entries(
    editMode ? form.config : currentTarget.config
  ).map(([key, value]) => (
    <div key={key}>
      <p className="text-xs text-muted-foreground">{key}</p>

      {editMode ? (
        <input
          value={String(value || "")}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              config: {
                ...prev.config,
                [key]: e.target.value,
              },
            }))
          }
          className="input"
        />
      ) : (
        <p className="text-sm font-medium break-all">
          {String(value)}
        </p>
      )}
    </div>
  ))}
</div>

        {/* Logs */}
        <TargetLogs targetId={currentTarget.id} />

      </div>
    </div>
  )
}

/* ---------------- UI ---------------- */

function Card({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <motion.div
      className="rounded-2xl border bg-card p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </motion.div>
  )
}