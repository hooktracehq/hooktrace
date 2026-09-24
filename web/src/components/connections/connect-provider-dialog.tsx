"use client"

import {
  Check,
  X,
} from "lucide-react"

import {
  useCreateConnection,
} from "@/hooks/connections/use-create-connection"

type Props = {
  open: boolean
  onClose: () => void
}

const PROVIDERS = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Receive Stripe webhook events",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Receive GitHub webhook events",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Receive Slack webhook events",
  },
  {
    id: "discord",
    name: "Discord",
    description: "Receive Discord webhook events",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Receive Notion webhook events",
  },
  {
    id: "razorpay",
    name: "Razorpay",
    description: "Receive Razorpay webhook events",
  },
  {
    id: "generic",
    name: "Generic",
    description: "Receive any custom webhook",
  },
]

export function ConnectProviderDialog({
  open,
  onClose,
}: Props) {
  const mutation = useCreateConnection()

  if (!open) {
    return null
  }

  async function handleConnect(
    provider: string
  ) {
    try {
      const result =
        await mutation.mutateAsync(provider)

      console.log(
        "[Connections] Provider connected:",
        result
      )

      onClose()
    } catch (error) {
      console.error(
        "[Connections] Failed to connect provider:",
        error
      )
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="
          w-full
          max-w-2xl
          rounded-2xl
          border
          border-border
          bg-background
          shadow-2xl
        "
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              Connect Provider
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Create a webhook endpoint for your provider.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-muted-foreground
              hover:bg-accent
              hover:text-foreground
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {PROVIDERS.map((provider) => {
            const connecting =
              mutation.isPending &&
              mutation.variables === provider.id

            return (
              <button
                key={provider.id}
                type="button"
                disabled={mutation.isPending}
                onClick={() =>
                  handleConnect(provider.id)
                }
                className="
                  rounded-xl
                  border
                  border-border
                  p-4
                  text-left
                  transition-colors
                  hover:border-orange-500/40
                  hover:bg-orange-500/[0.03]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">
                      {provider.name}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {provider.description}
                    </p>
                  </div>

                  {connecting ? (
                    <span className="text-xs text-muted-foreground">
                      Creating...
                    </span>
                  ) : (
                    <Check className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {mutation.isError && (
          <div className="border-t border-border px-5 py-4">
            <p className="text-sm text-rose-400">
              Failed to create the connection.
              Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}