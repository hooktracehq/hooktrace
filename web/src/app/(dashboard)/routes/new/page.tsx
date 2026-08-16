"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Route as RouteIcon,
} from "lucide-react"

import Link from "next/link"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"

export default function NewRoutePage() {
  const router = useRouter()

  const [route, setRoute] =
    useState("")

  const [mode, setMode] =
    useState<"dev" | "prod">("prod")

  const [devTarget, setDevTarget] =
    useState("")

  const [prodTarget, setProdTarget] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [created, setCreated] =
    useState<{
      token: string
      route: string
      secret: string
    } | null>(null)

  async function handleCreate(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (!route.trim()) {
      setError("Route name is required.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${API_URL}/routes/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            route: route.trim(),
            mode,
            dev_target:
              devTarget.trim() || null,
            prod_target:
              prodTarget.trim() || null,
          }),
        }
      )

      const data =
        await response.json()

      if (response.status === 401) {
        router.replace("/login")
        return
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to create route."
        )
      }

      setCreated(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create route."
      )
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    const endpoint =
      `${API_URL}/r/${created.token}/${created.route}`

    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6">
          <Link
            href="/routes"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              text-muted-foreground
              hover:text-foreground
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Routes
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface-1">
          <div className="border-b border-border p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <Check className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Route created
                </h1>

                <p className="text-sm text-muted-foreground">
                  Your webhook endpoint is ready.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <p className="mb-2 text-sm font-medium">
                Webhook Endpoint
              </p>

              <div className="flex items-center gap-2 rounded-xl border border-border bg-background/50 p-3">
                <code className="min-w-0 flex-1 break-all text-xs">
                  {endpoint}
                </code>

                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      endpoint
                    )
                  }
                  className="
                    shrink-0
                    rounded-lg
                    border
                    border-border
                    p-2
                    hover:bg-accent
                  "
                  title="Copy endpoint"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">
                Signing Secret
              </p>

              <div className="rounded-xl border border-border bg-background/50 p-3">
                <code className="break-all text-xs">
                  {created.secret}
                </code>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Store this secret securely. You can use
                it to verify incoming webhook signatures.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href="/routes"
                className="
                  rounded-lg
                  border border-border
                  px-4 py-2
                  text-sm
                  font-medium
                  hover:bg-accent
                "
              >
                Back to Routes
              </Link>

              <Link
                href={`/events?route=${encodeURIComponent(
                  created.route
                )}`}
                className="
                  rounded-lg
                  bg-primary
                  px-4 py-2
                  text-sm
                  font-medium
                  text-primary-foreground
                  hover:bg-primary/90
                "
              >
                View Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <Link
          href="/routes"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-muted-foreground
            hover:text-foreground
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Routes
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-surface-1">
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-3">
            <RouteIcon className="h-5 w-5 text-orange-400" />

            <div>
              <h1 className="text-xl font-semibold">
                Create Route
              </h1>

              <p className="text-sm text-muted-foreground">
                Create a webhook endpoint for your
                application.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="space-y-6 p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Route name
            </label>

            <input
              value={route}
              onChange={(event) =>
                setRoute(event.target.value)
              }
              placeholder="stripe-webhook"
              className="
                w-full
                rounded-lg
                border border-border
                bg-background
                px-3 py-2.5
                text-sm
                outline-none
                transition
                focus:border-primary
              "
            />

            <p className="mt-2 text-xs text-muted-foreground">
              This becomes part of your public webhook URL.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Mode
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("prod")}
                className={`
                  rounded-xl
                  border
                  p-4
                  text-left
                  transition
                  ${
                    mode === "prod"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  }
                `}
              >
                <p className="text-sm font-medium">
                  Production
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Receive real webhook traffic.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode("dev")}
                className={`
                  rounded-xl
                  border
                  p-4
                  text-left
                  transition
                  ${
                    mode === "dev"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  }
                `}
              >
                <p className="text-sm font-medium">
                  Development
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Forward events to your development
                  environment.
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Development target
            </label>

            <input
              value={devTarget}
              onChange={(event) =>
                setDevTarget(event.target.value)
              }
              placeholder="http://localhost:4000/webhooks"
              className="
                w-full
                rounded-lg
                border border-border
                bg-background
                px-3 py-2.5
                text-sm
                outline-none
                focus:border-primary
              "
            />

            <p className="mt-2 text-xs text-muted-foreground">
              Optional. Usually used together with a
              Hooktrace tunnel.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Production target
            </label>

            <input
              value={prodTarget}
              onChange={(event) =>
                setProdTarget(event.target.value)
              }
              placeholder="https://api.example.com/webhooks"
              className="
                w-full
                rounded-lg
                border border-border
                bg-background
                px-3 py-2.5
                text-sm
                outline-none
                focus:border-primary
              "
            />

            <p className="mt-2 text-xs text-muted-foreground">
              Optional. You can configure delivery
              destinations separately later.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Link
              href="/routes"
              className="
                rounded-lg
                border border-border
                px-4 py-2.5
                text-sm
                font-medium
                hover:bg-accent
              "
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-primary
                px-4 py-2.5
                text-sm
                font-medium
                text-primary-foreground
                hover:bg-primary/90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading
                ? "Creating..."
                : "Create Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}