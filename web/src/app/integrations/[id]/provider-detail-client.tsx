"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Code,
  Send,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"

import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import type { User } from "@/lib/auth"

/* ---------------- TYPES ---------------- */

type WebhookEvent = {
  event: string
  description: string
  examplePayload: Record<string, unknown>
}

type Provider = {
  id: string
  name: string
  webhooks: WebhookEvent[]
}

type Integration = {
  webhook_token: string
}

/* ---------------- COMPONENT ---------------- */

export default function ProviderDetailClient({
  provider,
  integration: initialIntegration,
  user,
}: {
  provider: Provider
  integration: Integration | null
  user: User
}) {
  const [copied, setCopied] = useState(false)

  const [integration, setIntegration] =
    useState<Integration | null>(initialIntegration)

  const [selectedEvent, setSelectedEvent] = useState(
    provider.webhooks?.[0]?.event ?? ""
  )

  const [testStatus, setTestStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle")

  const webhookUrl = integration?.webhook_token
    ? `${process.env.NEXT_PUBLIC_API_URL}/webhook/${integration.webhook_token}`
    : ""

  const handleConnect = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/integrations/${provider.id}`,
      {
        method: "POST",
        credentials: "include",
      }
    )

    const data = await res.json()

    setIntegration({
      webhook_token: data.webhook_url.split("/webhook/")[1],
    })
  }

  const handleDisconnect = async () => {
    if (!confirm("Disconnect this integration?")) return

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/integrations/${provider.id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    )

    setIntegration(null)
  }

  const selectedWebhook = provider.webhooks.find(
    (w) => w.event === selectedEvent
  )

  const handleTestWebhook = async () => {
    if (!webhookUrl) return

    setTestStatus("sending")

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          selectedWebhook?.examplePayload
        ),
      })

      setTestStatus("success")
    } catch {
      setTestStatus("error")
    }

    setTimeout(() => setTestStatus("idle"), 3000)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">
        {provider.name}
      </h1>

      {/* CONNECT BUTTON */}

      {integration ? (
        <button onClick={handleDisconnect}>
          Disconnect
        </button>
      ) : (
        <button onClick={handleConnect}>
          Connect
        </button>
      )}

      {/* WEBHOOK URL */}

      {webhookUrl && (
        <>
          <p>{webhookUrl}</p>

          <Link
            href={`/events?provider=${provider.id}`}
          >
            View Events →
          </Link>
        </>
      )}

      {/* TEST */}

      <button onClick={handleTestWebhook}>
        Send Test
      </button>

      <p>Status: {testStatus}</p>
    </div>
  )
}