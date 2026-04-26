

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
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import type { DeliveryTarget, TargetStats } from "@/types/delivery-target"
import EditTargetModal from "@/components/delivery-targets/EditTargetModal"
import TargetLogs from "../target-logs"
import InsightsPanel from "@/components/delivery-targets/InsightsPanel"

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
  const router = useRouter()

  const successRate = stats?.successRate || 0
  const isHealthy = successRate >= 95

  const [currentTarget, setCurrentTarget] = useState(target)

  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

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

  /* ---------------- TEST ---------------- */

  async function testTarget() {
    setLoading(true)
    setTestResult(null)
  
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${currentTarget.id}/test`,
        {
          method: "POST",
          credentials: "include",
        }
      )
  
      const data = await res.json()
  
      const first = data?.result?.details?.[0]
  
      setTestResult({
        success: data?.success,
        result: first?.result,
        error: first?.error,
      })
  
    } catch {
      setTestResult({
        success: false,
        error: "Request failed",
      })
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- INLINE UPDATE ---------------- */

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

      toast.success("Configuration updated")
    } catch {
      toast.error("Update failed")
    }
  }

  /* ---------------- DELETE ---------------- */

  async function deleteTarget() {
    if (!confirm("Delete this target?")) return

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${currentTarget.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )

      toast.success("Target deleted")
      router.push("/delivery-targets")
    } catch {
      toast.error("Delete failed")
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-start"
        >

          {/* LEFT */}
          <div>
            <h1 className="text-3xl font-bold">{currentTarget.name}</h1>

            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2 py-1 rounded bg-muted">
                {currentTarget.type}
              </span>

              {currentTarget.providers?.map((p) => (
                <span key={p} className="text-xs px-2 py-1 rounded bg-muted">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={testTarget}
              className="px-3 py-1.5 text-sm border rounded-md"
            >
              Test
            </motion.button>

            <EditTargetModal
              target={currentTarget}
              onUpdated={setCurrentTarget}
            />

            <ThemeToggle />
            <UserNav user={user} />
          </div>
        </motion.div>

        {/* STATUS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`p-4 rounded-2xl border ${
            isHealthy ? "bg-emerald-50" : "bg-amber-50"
          }`}
        >
          <div className="flex justify-between items-center">

            <div className="flex items-center gap-3">
              {isHealthy ? (
                <CheckCircle2 className="text-emerald-600" />
              ) : (
                <AlertTriangle className="text-amber-600" />
              )}

              <span className="text-sm">
                {isHealthy ? "Healthy" : "Issues detected"} ({successRate}%)
              </span>
            </div>

            <button
              onClick={testTarget}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 border rounded-md"
            >
              <Play className="w-4 h-4" />
              {loading ? "Testing..." : "Test"}
            </button>
          </div>

          {testResult && (
            <div className="mt-4 text-xs rounded-md p-3 border bg-muted space-y-1">
              <p className="font-medium">
                {testResult.success ? "✅ Success" : "❌ Failed"}
              </p>

              {testResult.result?.status_code && (
                <p>HTTP {testResult.result.status_code}</p>
              )}

              {testResult.result?.duration_ms && (
                <p>{testResult.result.duration_ms}ms</p>
              )}

              {testResult.error && (
                <p className="text-red-500">{testResult.error}</p>
              )}

              {testResult.result?.body && (
                <details>
                  <summary className="cursor-pointer text-muted-foreground">
                    View response
                  </summary>
                  <pre className="mt-2 bg-muted p-2 rounded text-[10px] overflow-auto">
                    {testResult.result.body.slice(0, 400)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </motion.div>

        {/* CONFIG */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border bg-card p-6 space-y-4"
        >
          {/* (unchanged content) */}
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
        </motion.div>

        {/* PROVIDERS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border bg-card p-6"
        >
          <h2 className="font-semibold mb-4">Providers</h2>

          <div className="flex gap-2 flex-wrap">
            {currentTarget.providers?.length ? (
              currentTarget.providers.map((p) => (
                <span key={p} className="text-xs px-2 py-1 rounded bg-muted">
                  {p}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                No provider restrictions
              </span>
            )}
          </div>
        </motion.div>

        {/* INSIGHTS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border bg-card p-6"
        >
          <h2 className="font-semibold mb-4">Observability Insight</h2>

          <p className="text-sm text-muted-foreground">
            {successRate >= 98
              ? "Delivery pipeline is highly stable."
              : successRate >= 90
              ? "Minor issues detected. Monitor retries."
              : "Significant failures detected. Check endpoint health."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
         <InsightsPanel logs={[]} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <TargetLogs targetId={currentTarget.id} />
        </motion.div>

      </div>
    </div>
  )
}