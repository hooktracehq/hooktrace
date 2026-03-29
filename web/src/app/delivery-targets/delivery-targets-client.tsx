"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Filter,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  Trash2,
  Power,
  PowerOff,
  Copy,
  Check,
  ExternalLink,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

type TargetType = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  configFields: Array<{
    name: string
    label: string
    type: string
    placeholder?: string
    options?: string[]
    required: boolean
  }>
}

type DeliveryTarget = {
  id: string
  name: string
  type: string
  config: Record<string, any>
  enabled: boolean
  createdAt: string
  lastUsed: string
  successCount: number
  errorCount: number
  providers: string[]
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

export default function DeliveryTargetsClient({
  user,
  deliveryTargets: initialTargets,
  targetTypes,
}: {
  user: User
  deliveryTargets: DeliveryTarget[]
  targetTypes: TargetType[]
}) {
  const [targets, setTargets] = useState(initialTargets)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedType, setSelectedType] = useState<TargetType | null>(null)

  // Filter targets
  const filteredTargets = targets.filter((target) => {
    const matchesSearch =
      target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || target.type === typeFilter

    return matchesSearch && matchesType
  })

  // Stats
  const totalTargets = targets.length
  const activeTargets = targets.filter((t) => t.enabled).length
  const totalDeliveries = targets.reduce((sum, t) => sum + t.successCount, 0)
  const totalErrors = targets.reduce((sum, t) => sum + t.errorCount, 0)
  const successRate = totalDeliveries + totalErrors > 0
    ? ((totalDeliveries / (totalDeliveries + totalErrors)) * 100).toFixed(1)
    : "100"

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
                <Send className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Delivery Targets</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure where webhooks are delivered
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
          <Send className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Multiple Delivery Destinations
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Route webhooks to HTTP endpoints, message queues, streaming platforms, or notification channels. Configure multiple targets and route events based on provider or event type.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-4"
        >
          <StatCard
            icon={Activity}
            label="Total Targets"
            value={totalTargets}
            color="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={activeTargets}
            color="emerald"
          />
          <StatCard
            icon={TrendingUp}
            label="Deliveries"
            value={totalDeliveries}
            color="violet"
          />
          <StatCard
            icon={AlertTriangle}
            label="Success Rate"
            value={`${successRate}%`}
            color="amber"
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
              placeholder="Search targets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Types</option>
            {targetTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Target
          </button>
        </motion.div>

        {/* Targets Grid */}
        {filteredTargets.length === 0 ? (
          <EmptyState
            hasTargets={targets.length > 0}
            onCreateTarget={() => setShowCreateModal(true)}
          />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 lg:grid-cols-2"
          >
            {filteredTargets.map((target) => (
              <TargetCard
                key={target.id}
                target={target}
                targetType={targetTypes.find((t) => t.id === target.type)!}
                onToggle={(id) => {
                  setTargets(
                    targets.map((t) =>
                      t.id === id ? { ...t, enabled: !t.enabled } : t
                    )
                  )
                }}
                onDelete={(id) => {
                  if (confirm("Delete this target?")) {
                    setTargets(targets.filter((t) => t.id !== id))
                  }
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <CreateTargetModal
            targetTypes={targetTypes}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            onClose={() => {
              setShowCreateModal(false)
              setSelectedType(null)
            }}
            onCreate={(target) => {
              setTargets([target, ...targets])
              setShowCreateModal(false)
              setSelectedType(null)
            }}
          />
        )}

        {/* Available Types */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Available Target Types</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {targetTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">{type.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </div>
            ))}
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
  icon: any
  label: string
  value: number | string
  color: "blue" | "emerald" | "violet" | "amber"
  isText?: boolean
}) {
  const colorMap = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
    violet: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
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

function TargetCard({
  target,
  targetType,
  onToggle,
  onDelete,
}: {
  target: DeliveryTarget
  targetType: TargetType
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [showConfig, setShowConfig] = useState(false)
  const successRate = target.successCount + target.errorCount > 0
    ? ((target.successCount / (target.successCount + target.errorCount)) * 100).toFixed(1)
    : "100"

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-12 h-12 rounded-xl ${targetType.color} flex items-center justify-center text-2xl`}>
            {targetType.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{target.name}</h3>
              <div className={`
                flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
                ${target.enabled
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
                }
              `}>
                {target.enabled ? <CheckCircle2 className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                {target.enabled ? "Active" : "Disabled"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{targetType.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(target.id)}
            className={`p-2 rounded-lg border border-border hover:bg-accent transition-colors ${
              target.enabled ? "text-amber-600" : "text-emerald-600"
            }`}
            title={target.enabled ? "Disable" : "Enable"}
          >
            {target.enabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
            title="Configure"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(target.id)}
            className="p-2 rounded-lg border border-border hover:bg-accent text-rose-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Deliveries</p>
          <p className="text-lg font-bold">{target.successCount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Errors</p>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
            {target.errorCount}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
          <p className="text-lg font-bold">{successRate}%</p>
        </div>
      </div>

      {/* Providers */}
      {target.providers.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Connected Providers:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {target.providers.map((provider) => (
              <span
                key={provider}
                className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium capitalize"
              >
                {provider}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Config Preview */}
      {showConfig && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Configuration:
          </p>
          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(target.config).filter(([k]) => !k.includes("secret") && !k.includes("password"))
              ),
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Last used {new Date(target.lastUsed).toLocaleString()}
        </div>
        <Link
          href={`/delivery-targets/${target.id}/logs`}
          className="text-primary hover:underline flex items-center gap-1"
        >
          View Logs
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  )
}

function EmptyState({
  hasTargets,
  onCreateTarget,
}: {
  hasTargets: boolean
  onCreateTarget: () => void
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="text-center py-12 rounded-xl border border-border bg-card"
    >
      <div className="mx-auto w-fit p-3 rounded-full bg-muted/50 mb-4">
        <Send className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {hasTargets ? "No matching targets" : "No delivery targets yet"}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        {hasTargets
          ? "Try adjusting your search or filters"
          : "Create your first delivery target to start routing webhooks"}
      </p>
      {!hasTargets && (
        <button
          onClick={onCreateTarget}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Your First Target
        </button>
      )}
    </motion.div>
  )
}

function CreateTargetModal({
  targetTypes,
  selectedType,
  onSelectType,
  onClose,
  onCreate,
}: {
  targetTypes: TargetType[]
  selectedType: TargetType | null
  onSelectType: (type: TargetType | null) => void
  onClose: () => void
  onCreate: (target: DeliveryTarget) => void
}) {
  const [name, setName] = useState("")
  const [config, setConfig] = useState<Record<string, any>>({})
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = () => {
    if (!selectedType) return

    setIsCreating(true)

    setTimeout(() => {
      const newTarget: DeliveryTarget = {
        id: `target-${Date.now()}`,
        name: name || `${selectedType.name} Target`,
        type: selectedType.id,
        config,
        enabled: true,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        successCount: 0,
        errorCount: 0,
        providers: [],
      }

      onCreate(newTarget)
      setIsCreating(false)
    }, 1000)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Create Delivery Target</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedType ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Select a target type to get started:
              </p>
              {targetTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onSelectType(type)}
                  className="w-full flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{type.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className={`w-10 h-10 rounded-lg ${selectedType.color} flex items-center justify-center text-2xl`}>
                  {selectedType.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedType.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedType.description}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Target Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={`My ${selectedType.name}`}
                />
              </div>

              {selectedType.configFields.map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium mb-2 block">
                    {field.label}
                    {field.required && <span className="text-rose-500 ml-1">*</span>}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={config[field.name] || ""}
                      onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config[field.name] || false}
                        onChange={(e) => setConfig({ ...config, [field.name]: e.target.checked })}
                        className="rounded border-border"
                      />
                      <span className="text-sm">Enable</span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      value={config[field.name] || ""}
                      onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedType && (
          <div className="p-6 border-t border-border flex gap-3">
            <button
              onClick={() => onSelectType(null)}
              className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || !name}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Create Target"}
            </button>
          </div>
        )}
      </motion.div>
    </>
  )
}






const handleToggle = async (id: string) => {
    const target = targets.find(t => t.id === id)
    if (!target) return
    
    try {
      await fetch(`http://localhost:3001/delivery-targets/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !target.enabled })
      })
      
      // Update local state
      setTargets(
        targets.map((t) =>
          t.id === id ? { ...t, enabled: !t.enabled } : t
        )
      )
    } catch (error) {
      console.error('Failed to toggle target:', error)
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this target?")) return
    
    try {
      await fetch(`http://localhost:3001/delivery-targets/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      // Update local state
      setTargets(targets.filter((t) => t.id !== id))
    } catch (error) {
      console.error('Failed to delete target:', error)
    }
  }
  
  const handleCreate = async (newTarget: any) => {
    try {
      const response = await fetch('http://localhost:3001/delivery-targets', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTarget)
      })
      
      const created = await response.json()
      setTargets([created, ...targets])
      return created
    } catch (error) {
      console.error('Failed to create target:', error)
      throw error
    }
  }