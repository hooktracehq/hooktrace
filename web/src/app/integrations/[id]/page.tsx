import { getCurrentUser } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import ProviderDetailClient from "@/app/integrations/[id]/provider-detail-client"

// Provider configurations (same as before)
const PROVIDERS = {
  stripe: {
    id: "stripe",
    name: "Stripe",
    description: "Accept payments and manage subscriptions",
    icon: "💳",
    color: "bg-purple-500",
    category: "payments",
    docsUrl: "https://stripe.com/docs/webhooks",
    webhooks: [
      {
        event: "payment_intent.succeeded",
        description: "Occurs when a payment intent succeeds",
        examplePayload: {
          id: "pi_xxx",
          object: "payment_intent",
          amount: 1000,
          currency: "usd",
          status: "succeeded",
        },
      },
      {
        event: "customer.created",
        description: "Occurs when a new customer is created",
        examplePayload: {
          id: "cus_xxx",
          object: "customer",
          email: "customer@example.com",
        },
      },
      {
        event: "charge.failed",
        description: "Occurs when a charge fails",
        examplePayload: {
          id: "ch_xxx",
          object: "charge",
          amount: 1000,
          status: "failed",
        },
      },
    ],
    setupSteps: [
      "Go to Stripe Dashboard → Developers → Webhooks",
      "Click 'Add endpoint'",
      "Paste your HookTrace webhook URL",
      "Select events to listen to",
      "Copy the signing secret",
    ],
  },
  github: {
    id: "github",
    name: "GitHub",
    description: "Track repository events and actions",
    icon: "🐙",
    color: "bg-gray-900 dark:bg-gray-700",
    category: "developer",
    docsUrl: "https://docs.github.com/webhooks",
    webhooks: [
      {
        event: "push",
        description: "Triggered when commits are pushed to a repository",
        examplePayload: {
          ref: "refs/heads/main",
          repository: { name: "repo-name", full_name: "user/repo-name" },
          commits: [{ message: "Update README", author: { name: "John" } }],
        },
      },
      {
        event: "pull_request",
        description: "Triggered when a pull request is opened, closed, etc",
        examplePayload: {
          action: "opened",
          pull_request: { title: "Fix bug", state: "open", number: 123 },
        },
      },
      {
        event: "issues",
        description: "Triggered when an issue is created, updated, or deleted",
        examplePayload: {
          action: "opened",
          issue: { title: "Bug report", number: 456, state: "open" },
        },
      },
    ],
    setupSteps: [
      "Go to your repository → Settings → Webhooks",
      "Click 'Add webhook'",
      "Enter your HookTrace webhook URL",
      "Select 'application/json' content type",
      "Choose which events to trigger",
      "Add the webhook",
    ],
  },
  shopify: {
    id: "shopify",
    name: "Shopify",
    description: "Monitor store orders and inventory",
    icon: "🛍️",
    color: "bg-emerald-600",
    category: "ecommerce",
    docsUrl: "https://shopify.dev/docs/apps/webhooks",
    webhooks: [
      {
        event: "orders/create",
        description: "Triggered when a new order is created",
        examplePayload: {
          id: 12345,
          email: "customer@example.com",
          total_price: "100.00",
          line_items: [],
        },
      },
      {
        event: "products/update",
        description: "Triggered when a product is updated",
        examplePayload: {
          id: 67890,
          title: "Product Name",
          variants: [],
        },
      },
    ],
    setupSteps: [
      "Go to Shopify Admin → Settings → Notifications",
      "Scroll to 'Webhooks' section",
      "Click 'Create webhook'",
      "Select event type",
      "Enter your HookTrace URL",
      "Save the webhook",
    ],
  },
  razorpay: {
    id: "razorpay",
    name: "Razorpay",
    description: "Track payments and refunds",
    icon: "💰",
    color: "bg-blue-600",
    category: "payments",
    docsUrl: "https://razorpay.com/docs/webhooks",
    webhooks: [
      {
        event: "payment.captured",
        description: "Triggered when a payment is captured",
        examplePayload: {
          entity: "payment",
          amount: 50000,
          currency: "INR",
          status: "captured",
        },
      },
      {
        event: "payment.failed",
        description: "Triggered when a payment fails",
        examplePayload: {
          entity: "payment",
          amount: 50000,
          status: "failed",
        },
      },
    ],
    setupSteps: [
      "Log in to Razorpay Dashboard",
      "Go to Settings → Webhooks",
      "Click 'Create New Webhook'",
      "Enter your HookTrace URL",
      "Select events to monitor",
      "Save and note the webhook secret",
    ],
  },
  slack: {
    id: "slack",
    name: "Slack",
    description: "Receive workspace events and messages",
    icon: "💬",
    color: "bg-purple-600",
    category: "communication",
    docsUrl: "https://api.slack.com/messaging/webhooks",
    webhooks: [
      {
        event: "message.channels",
        description: "Triggered when a message is posted to a channel",
        examplePayload: {
          type: "message",
          channel: "C1234567890",
          user: "U1234567890",
          text: "Hello world",
        },
      },
    ],
    setupSteps: [
      "Create a Slack App at api.slack.com/apps",
      "Enable Event Subscriptions",
      "Enter your HookTrace URL",
      "Subscribe to bot events",
      "Install app to workspace",
    ],
  },
  discord: {
    id: "discord",
    name: "Discord",
    description: "Monitor server events and messages",
    icon: "🎮",
    color: "bg-indigo-600",
    category: "communication",
    docsUrl: "https://discord.com/developers/docs/topics/webhooks",
    webhooks: [
      {
        event: "message.create",
        description: "Triggered when a message is created",
        examplePayload: {
          content: "Hello!",
          author: { username: "User", id: "123" },
        },
      },
    ],
    setupSteps: [
      "Go to Server Settings → Integrations",
      "Click 'Webhooks'",
      "Click 'New Webhook'",
      "Copy webhook URL",
      "Configure channel and name",
    ],
  },
  notion: {
    id: "notion",
    name: "Notion",
    description: "Track page and database changes",
    icon: "📝",
    color: "bg-gray-800 dark:bg-gray-600",
    category: "productivity",
    docsUrl: "https://developers.notion.com",
    webhooks: [
      {
        event: "page.created",
        description: "Triggered when a new page is created",
        examplePayload: {
          object: "page",
          id: "xxx",
          properties: {},
        },
      },
    ],
    setupSteps: [
      "Create Notion integration",
      "Get integration token",
      "Share page with integration",
      "Configure webhook URL",
    ],
  },
  supabase: {
    id: "supabase",
    name: "Supabase",
    description: "Monitor database and auth events",
    icon: "⚡",
    color: "bg-emerald-500",
    category: "database",
    docsUrl: "https://supabase.com/docs/guides/database/webhooks",
    webhooks: [
      {
        event: "db.insert",
        description: "Triggered on database insert",
        examplePayload: {
          type: "INSERT",
          table: "users",
          record: { id: 1, email: "user@example.com" },
        },
      },
    ],
    setupSteps: [
      "Go to Supabase Dashboard",
      "Navigate to Database → Webhooks",
      "Create new webhook",
      "Select table and events",
      "Enter HookTrace URL",
    ],
  },
}



type Integration = {
  provider: string
  webhook_token: string
}
export default async function ProviderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const provider = PROVIDERS[params.id as keyof typeof PROVIDERS]
  if (!provider) notFound()

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations`, {
      cache: "no-store",
      credentials: "include",
    })
    
    const data = await res.json()
    
    const items = data.items as Integration[]

const isConnected = items.some((i) => i.provider === params.id)

  return (
    <ProviderDetailClient
      provider={provider}
      isConnected={isConnected}
      user={user}
    />
  )
}