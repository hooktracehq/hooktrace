"use client"
import { type LucideIcon } from "lucide-react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Zap,
  Copy,
  Check,
  Play,
  Square,
  Trash2,
  ExternalLink,
  Terminal,
  Globe,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  Code,
} from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

type Tunnel = {
  id: string
  name: string
  localUrl: string
  publicUrl: string
  status: "active" | "paused" | "error"
  createdAt: string
  requestCount: number
  lastRequest: string | null
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

export default function DevModeClient({
  user,
  activeTunnels,
}: {
  user: User
  activeTunnels: Tunnel[]
}) {
  const [tunnels, setTunnels] = useState(activeTunnels)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
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
                <Terminal className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dev Mode</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Forward webhooks to your local development server
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
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              What is Dev Mode?
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Dev Mode creates a secure tunnel from HookTrace to your localhost, allowing you to receive webhooks on your local development server. Perfect for testing integrations without deploying.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-3"
        >
          <StatCard
            icon={Activity}
            label="Active Tunnels"
            value={tunnels.filter((t) => t.status === "active").length}
            color="emerald"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Requests"
            value={tunnels.reduce((sum, t) => sum + t.requestCount, 0)}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="Uptime"
            value={tunnels.length > 0 ? "30m" : "0m"}
            color="violet"
            isText
          />
        </motion.div>

        {/* Create Tunnel Button */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex justify-between items-center"
        >
          <h2 className="text-xl font-semibold">Your Tunnels</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Tunnel
          </button>
        </motion.div>

        {/* Tunnels List */}
        {tunnels.length === 0 ? (
          <EmptyState onCreateTunnel={() => setShowCreateModal(true)} />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {tunnels.map((tunnel) => (
              <TunnelCard
                key={tunnel.id}
                tunnel={tunnel}
                onCopy={copyToClipboard}
                isCopied={copied === tunnel.id}
              />
            ))}
          </motion.div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <CreateTunnelModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(tunnel) => {
              setTunnels([tunnel, ...tunnels])
              setShowCreateModal(false)
            }}
          />
        )}

        {/* How it Works */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">How It Works</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <h3 className="font-semibold">Create Tunnel</h3>
              <p className="text-sm text-muted-foreground">
                Specify your localhost URL (e.g., http://localhost:3000)
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <h3 className="font-semibold">Get Public URL</h3>
              <p className="text-sm text-muted-foreground">
                Receive a public HookTrace URL that forwards to your local server
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <h3 className="font-semibold">Receive Webhooks</h3>
              <p className="text-sm text-muted-foreground">
                All webhooks sent to the public URL are forwarded to your localhost
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
  icon: LucideIcon
  label: string
  value: number | string
  color: "emerald" | "blue" | "violet"
  isText?: boolean
}) {
  const colorMap = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
    violet: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30",
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
      <p className={`${isText ? "text-2xl" : "text-2xl"} font-bold mb-1`}>
        {isText ? value : typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  )
}

function TunnelCard({
  tunnel,
  onCopy,
  isCopied,
}: {
  tunnel: Tunnel
  onCopy: (text: string, id: string) => void
  isCopied: boolean
}) {
  const [status, setStatus] = useState(tunnel.status)

  const handleToggle = () => {
    setStatus(status === "active" ? "paused" : "active")
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this tunnel?")) {
      // In production, call backend to delete
      alert("Delete tunnel - implement backend call")
    }
  }

  const statusColors = {
    active: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    paused: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    error: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900",
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
            <h3 className="text-lg font-semibold">{tunnel.name}</h3>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Created {new Date(tunnel.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className={`p-2 rounded-lg border border-border hover:bg-accent transition-colors ${
              status === "active" ? "text-amber-600" : "text-emerald-600"
            }`}
            title={status === "active" ? "Pause" : "Resume"}
          >
            {status === "active" ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg border border-border hover:bg-accent text-rose-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* URLs */}
      <div className="space-y-3 mb-4">
        {/* Public URL */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Public URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted font-mono text-sm">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{tunnel.publicUrl}</span>
            </div>
            <button
              onClick={() => onCopy(tunnel.publicUrl, tunnel.id)}
              className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <a
              href={tunnel.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Local URL */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Forwarding To
          </label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted font-mono text-sm">
            <Terminal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{tunnel.localUrl}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Requests</p>
            <p className="text-lg font-bold">{tunnel.requestCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Request</p>
            <p className="text-sm font-medium">
              {tunnel.lastRequest
                ? new Date(tunnel.lastRequest).toLocaleTimeString()
                : "None"}
            </p>
          </div>
        </div>

        <Link
          href={`/dev-mode/${tunnel.id}/logs`}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View Logs
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  )
}

function EmptyState({ onCreateTunnel }: { onCreateTunnel: () => void }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="text-center py-12 rounded-xl border border-border bg-card"
    >
      <div className="mx-auto w-fit p-3 rounded-full bg-muted/50 mb-4">
        <Terminal className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No tunnels yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        Create your first tunnel to start forwarding webhooks to your local development server
      </p>
      <button
        onClick={onCreateTunnel}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors inline-flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Your First Tunnel
      </button>
    </motion.div>
  )
}

function CreateTunnelModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (tunnel: Tunnel) => void
}) {
  const [name, setName] = useState("My Local Server")
  const [localUrl, setLocalUrl] = useState("http://localhost:3000")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    setIsCreating(true)
  
    // In production, call backend to create tunnel 
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tunnels`, {
      method: "POST",                                 
      credentials: "include", 
      headers: { "Content-Type": "application/json" },    // now calling real API
      body: JSON.stringify({
        name,
        local_url: localUrl,
      }),
    })
    
    const newTunnel = await res.json()
    onCreate(newTunnel)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl shadow-xl z-50 p-6"
      >
        <h2 className="text-xl font-bold mb-4">Create New Tunnel</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tunnel Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="My Local Server"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Local URL
            </label>
            <input
              type="text"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              placeholder="http://localhost:3000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The local URL where webhooks will be forwarded
            </p>
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
            disabled={isCreating || !name || !localUrl}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Tunnel"}
          </button>
        </div>
      </motion.div>
    </>
  )
}