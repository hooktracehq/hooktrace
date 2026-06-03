
"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  Trash2,
  Power,
  PowerOff,
  TrendingUp,
  Zap,
  Filter,
  Package,
  AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

type AggregationRule = {
  id: string
  name: string
  provider: string
  eventPatterns: string[]
  enabled: boolean
  config: {
    mode: "time_window" | "count" | "rate_limit"
    windowMs?: number
    maxBatchSize?: number
    timeoutMs?: number
    deduplicate?: boolean
    deduplicationKey?: string
    maxEventsPerSecond?: number
  }
  stats: {
    eventsProcessed: number
    batchesCreated: number
    averageBatchSize: number
    duplicatesSkipped: number
  }
  createdAt: string
  lastTriggered: string | null
}

type User = {
  email: string
  avatar_url?: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

export default function BulkAggregationClient({
  user,
  aggregationRules: initialRules,
}: {
  user: User
  aggregationRules: AggregationRule[]
}) {
  const [rules, setRules] = useState(initialRules)
  const [searchQuery, setSearchQuery] = useState("")
  const [providerFilter, setProviderFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Filter rules
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.provider.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesProvider = providerFilter === "all" || rule.provider === providerFilter

    return matchesSearch && matchesProvider
  })

  // Stats
  const totalRules = rules.length
  const activeRules = rules.filter((r) => r.enabled).length
  const totalEvents = rules.reduce((sum, r) => sum + r.stats.eventsProcessed, 0)
  const totalBatches = rules.reduce((sum, r) => sum + r.stats.batchesCreated, 0)
  const avgBatchSize = totalBatches > 0 ? (totalEvents / totalBatches).toFixed(1) : "0"




  async function toggleRule(rule: AggregationRule) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/aggregation/${rule.id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: !rule.enabled,
        }),
      }
    )
  
    const updated = await res.json()
  
    setRules((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    )
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Bulk Aggregation</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Coalesce rapid events into batches for efficient processing
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <ThemeToggle />
            <UserNav user={user} />
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30"
        >
          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              What is Bulk Aggregation?
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Instead of processing each webhook immediately, batch similar events together within a time window or count threshold. Perfect for high-volume scenarios like analytics tracking, notification batching, or rate limiting API calls.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <StatCard
            icon={Package}
            label="Total Rules"
            value={totalRules}
            color="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={activeRules}
            color="emerald"
          />
          <StatCard
            icon={Zap}
            label="Events Processed"
            value={totalEvents}
            color="violet"
          />
          <StatCard
            icon={Layers}
            label="Batches Created"
            value={totalBatches}
            color="amber"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Batch Size"
            value={avgBatchSize}
            color="rose"
            isText
          />
        </motion.div>

        {/* Controls */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Provider Filter */}
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Providers</option>
            <option value="stripe">Stripe</option>
            <option value="github">GitHub</option>
            <option value="shopify">Shopify</option>
            <option value="slack">Slack</option>
          </select>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Rule
          </button>
        </motion.div>

        {/* Rules List */}
        {filteredRules.length === 0 ? (
          <EmptyState
            hasRules={rules.length > 0}
            onCreateRule={() => setShowCreateModal(true)}
          />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filteredRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onToggle={(id) => {
                  const rule = rules.find(r => r.id === id)
                  if (rule) toggleRule(rule)
                }}
                onDelete={async (id) => {
                  if (!confirm("Delete this rule?")) return
                
                  await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/aggregation/${id}`,
                    {
                      method: "DELETE",
                      credentials: "include",
                    }
                  )
                
                  setRules((prev) => prev.filter((r) => r.id !== id))
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <CreateRuleModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(rule) => {
              setRules([rule, ...rules])
              setShowCreateModal(false)
            }}
          />
        )}

        {/* How It Works */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Aggregation Modes</h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold">Time Window</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Collect events for a fixed time period (e.g., 5 seconds), then process as a batch
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold">Count-Based</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Wait until N events accumulate, then process together (with optional timeout)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold">Rate Limit</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Process maximum X events per second, queuing excess for later batches
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ------------------ Components ------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  isText = false,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  color: "blue" | "emerald" | "violet" | "amber" | "rose"
  isText?: boolean
}) {
  const colorMap = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
    violet: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30",
  }

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-lg border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold mb-1">
        {isText ? value : typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  )
}

function RuleCard({
  rule,
  onToggle,
  onDelete,
}: {
  rule: AggregationRule
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [showConfig, setShowConfig] = useState(false)

  const getModeLabel = () => {
    switch (rule.config.mode) {
      case "time_window":
        return `Time Window (${rule.config.windowMs}ms)`
      case "count":
        return `Count-Based (${rule.config.maxBatchSize} events)`
      case "rate_limit":
        return `Rate Limit (${rule.config.maxEventsPerSecond}/s)`
      default:
        return rule.config.mode
    }
  }

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold">{rule.name}</h3>
            <div className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
              ${rule.enabled
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
              }
            `}>
              {rule.enabled ? <CheckCircle2 className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
              {rule.enabled ? "Active" : "Disabled"}
            </div>
            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium capitalize">
              {rule.provider}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Settings className="w-3 h-3" />
              {getModeLabel()}
            </div>
            {rule.config.deduplicate && (
              <div className="flex items-center gap-1.5">
                <Filter className="w-3 h-3" />
                Deduplication On
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(rule.id)}
            className={`p-2 rounded-lg border border-border hover:bg-accent transition-colors ${
              rule.enabled ? "text-amber-600" : "text-emerald-600"
            }`}
            title={rule.enabled ? "Disable" : "Enable"}
          >
            {rule.enabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
            title="Configure"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            className="p-2 rounded-lg border border-border hover:bg-accent text-rose-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Event Patterns */}
      <div className="mb-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Event Patterns:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {rule.eventPatterns.map((pattern) => (
            <span
              key={pattern}
              className="px-2 py-1 rounded-md bg-muted text-xs font-mono"
            >
              {pattern}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Events</p>
          <p className="text-lg font-bold">{rule.stats.eventsProcessed.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Batches</p>
          <p className="text-lg font-bold">{rule.stats.batchesCreated}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Avg Size</p>
          <p className="text-lg font-bold">{rule.stats.averageBatchSize}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Deduped</p>
          <p className="text-lg font-bold">{rule.stats.duplicatesSkipped}</p>
        </div>
      </div>

      {/* Config Preview */}
      {showConfig && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Configuration:
          </p>
          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(rule.config, null, 2)}
          </pre>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Last triggered {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleString() : "Never"}
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState({
  hasRules,
  onCreateRule,
}: {
  hasRules: boolean
  onCreateRule: () => void
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="text-center py-12 rounded-xl border border-border bg-card"
    >
      <div className="mx-auto w-fit p-3 rounded-full bg-muted/50 mb-4">
        <Layers className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {hasRules ? "No matching rules" : "No aggregation rules yet"}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        {hasRules
          ? "Try adjusting your search or filters"
          : "Create your first aggregation rule to start batching events"}
      </p>
      {!hasRules && (
        <button
          onClick={onCreateRule}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Your First Rule
        </button>
      )}
    </motion.div>
  )
}

function CreateRuleModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (rule: AggregationRule) => void
}) {
  const [name, setName] = useState("")
  const [provider, setProvider] = useState("stripe")
  const [mode, setMode] = useState<"time_window" | "count" | "rate_limit">("time_window")
  const [windowMs, setWindowMs] = useState(5000)
  const [maxBatchSize, setMaxBatchSize] = useState(50)
  const [deduplicate, setDeduplicate] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // const handleCreate = () => {
  //   setIsCreating(true)

  //   setTimeout(() => {
  //     const newRule: AggregationRule = {
  //       id: `rule-${Date.now()}`,
  //       name: name || `${provider} Aggregation`,
  //       provider,
  //       eventPatterns: ["*"],
  //       enabled: true,
  //       config: {
  //         mode,
  //         windowMs: mode === "time_window" ? windowMs : undefined,
  //         maxBatchSize,
  //         deduplicate,
  //         deduplicationKey: deduplicate ? "id" : undefined,
  //       },
  //       stats: {
  //         eventsProcessed: 0,
  //         batchesCreated: 0,
  //         averageBatchSize: 0,
  //         duplicatesSkipped: 0,
  //       },
  //       createdAt: new Date().toISOString(),
  //       lastTriggered: null,
  //     }

  //     onCreate(newRule)
  //     setIsCreating(false)
  //   }, 1000)
  // }


  async function handleCreate() {
    setIsCreating(true)
  
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/aggregation`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          provider,
          eventPatterns: ["*"],
          config: {
            mode,
            windowMs,
            maxBatchSize,
            deduplicate,
            deduplicationKey: deduplicate ? "id" : null,
          },
        }),
      }
    )
  
    const newRule = await res.json()
  
    onCreate(newRule)
    setIsCreating(false)
  }
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border rounded-xl shadow-xl z-50 p-6"
      >
        <h2 className="text-xl font-bold mb-4">Create Aggregation Rule</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Rule Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Stripe Payment Batching"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="stripe">Stripe</option>
              <option value="github">GitHub</option>
              <option value="shopify">Shopify</option>
              <option value="slack">Slack</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Aggregation Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "time_window" | "count" | "rate_limit")}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="time_window">Time Window</option>
              <option value="count">Count-Based</option>
              <option value="rate_limit">Rate Limit</option>
            </select>
          </div>

          {mode === "time_window" && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Window (milliseconds)
              </label>
              <input
                type="number"
                value={windowMs}
                onChange={(e) => setWindowMs(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Max Batch Size
            </label>
            <input
              type="number"
              value={maxBatchSize}
              onChange={(e) => setMaxBatchSize(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={deduplicate}
                onChange={(e) => setDeduplicate(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Enable Deduplication</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !name}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Rule"}
          </button>
        </div>
      </motion.div>
    </>
  )
}