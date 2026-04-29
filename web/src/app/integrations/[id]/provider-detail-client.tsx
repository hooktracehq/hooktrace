// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import {
//   ArrowLeft,
//   Copy,
//   Check,
//   ExternalLink,
//   Zap,
//   Code,
//   Send,
//   CheckCircle2,
//   XCircle,
//   ChevronDown,
//   ChevronUp,
//   AlertCircle,
// } from "lucide-react"
// import { motion } from "framer-motion"
// import { ThemeToggle } from "@/components/theme-toggle"
// import { UserNav } from "@/components/user-nav"

// type WebhookEvent = {
//   event: string
//   description: string
//   examplePayload: Record<string, unknown>
// }

// type Provider = {
//   id: string
//   name: string
//   description: string
//   icon: string
//   color: string
//   category: string
//   docsUrl: string
//   webhooks: WebhookEvent[]
//   setupSteps: string[]
// }

// type User = {
//   email: string
//   avatar_url?: string
// }

// const fadeUp = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
// }

// export default function ProviderDetailClient({
//   provider,
//   isConnected,
//   user,
// }: {
//   provider: Provider
//   isConnected: boolean
//   user: User
// }) {
//   const [copied, setCopied] = useState(false)
//   const [selectedEvent, setSelectedEvent] = useState(provider.webhooks[0]?.event || "")
//   const [showPayload, setShowPayload] = useState<string | null>(null)
//   const [testStatus, setTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle")

//   // Generate webhook URL (in production, fetch from backend)
//   const webhookUrl = integration?.webhook_token
//   ? `${process.env.NEXT_PUBLIC_API_URL}/webhook/${integration.webhook_token}`
//   : ""

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text)
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }

//   const handleTestWebhook = async () => {
//     setTestStatus("sending")
    
//     // Simulate API call
//     setTimeout(() => {
//       setTestStatus("success")
//       setTimeout(() => setTestStatus("idle"), 3000)
//     }, 1500)
//   }

//   const handleConnect = async () => {
//     const res = await fetch(`/api/integrations/${provider.id}`, {
//       method: "POST",
//       credentials: "include",
//     })
  
//     const data = await res.json()
  
//     console.log(data)
//   }

//   const handleDisconnect = () => {
//     // In production, call your backend to remove integration
//     if (confirm("Are you sure you want to disconnect this integration?")) {
//       alert("Disconnect integration - implement backend call")

//       await fetch(`/api/integrations/${provider.id}`, {
//         method: "DELETE",
//         credentials: "include",
//       })
//     }
//   }

//   const selectedWebhook = provider.webhooks.find((w) => w.event === selectedEvent)

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
//         {/* Header */}
//         <motion.div
//           variants={fadeUp}
//           initial="hidden"
//           animate="show"
//           className="space-y-4"
//         >
//           {/* Back Button */}
//           <Link
//             href="/integrations"
//             className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Integrations
//           </Link>

//           {/* Provider Header */}
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-4">
//               <div className={`w-16 h-16 rounded-xl ${provider.color} flex items-center justify-center text-4xl`}>
//                 {provider.icon}
//               </div>
//               <div>
//                 <div className="flex items-center gap-3 mb-1">
//                   <h1 className="text-3xl font-bold">{provider.name}</h1>
//                   {isConnected && (
//                     <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
//                       <CheckCircle2 className="w-4 h-4" />
//                       Connected
//                     </div>
//                   )}
//                 </div>
//                 <p className="text-muted-foreground">{provider.description}</p>
//                 <div className="flex items-center gap-3 mt-2">
//                   <span className="text-xs text-muted-foreground capitalize px-2 py-1 rounded-md bg-muted">
//                     {provider.category}
//                   </span>
//                   <a
//                     href={provider.docsUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-xs text-primary hover:underline flex items-center gap-1"
//                   >
//                     Documentation
//                     <ExternalLink className="w-3 h-3" />
//                   </a>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <ThemeToggle />
//               <UserNav user={user} />
//             </div>
//           </div>

//           {/* Action Button */}
//           {isConnected ? (
//             <button
//               onClick={handleDisconnect}
//               className="px-4 py-2 rounded-lg border border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-sm font-medium transition-colors"
//             >
//               Disconnect
//             </button>
//           ) : (
//             <button
//               onClick={handleConnect}
//               className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
//             >
//               Connect {provider.name}
//             </button>
//           )}
//         </motion.div>

//         {/* Main Content Grid */}
//         <div className="grid gap-6 lg:grid-cols-2">
//           {/* Left Column */}
//           <div className="space-y-6">
//             {/* Setup Instructions */}
//             <motion.div
//               variants={fadeUp}
//               initial="hidden"
//               animate="show"
//               className="rounded-xl border border-border bg-card p-6"
//             >
//               <div className="flex items-center gap-2 mb-4">
//                 <Zap className="w-5 h-5 text-primary" />
//                 <h2 className="text-lg font-semibold">Setup Instructions</h2>
//               </div>

//               <ol className="space-y-3">
//                 {provider.setupSteps.map((step, index) => (
//                   <li key={index} className="flex gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
//                       {index + 1}
//                     </span>
//                     <p className="text-sm text-muted-foreground pt-0.5">{step}</p>
//                   </li>
//                 ))}
//               </ol>
//             </motion.div>

//             {/* Webhook URL */}
//             <motion.div
//               variants={fadeUp}
//               initial="hidden"
//               animate="show"
//               className="rounded-xl border border-border bg-card p-6"
//             >
//               <div className="flex items-center gap-2 mb-4">
//                 <Code className="w-5 h-5 text-primary" />
//                 <h2 className="text-lg font-semibold">Your Webhook URL</h2>
//               </div>

//               <div className="space-y-3">
//                 <div className="flex items-center gap-2">
//                   <div className="flex-1 px-4 py-2.5 rounded-lg bg-muted font-mono text-sm overflow-x-auto">
//                     {webhookUrl}
//                   </div>
//                   <button
//                     onClick={() => copyToClipboard(webhookUrl)}
//                     className="p-2.5 rounded-lg border border-border hover:bg-accent transition-colors"
//                   >
//                     {copied ? (
//                       <Check className="w-4 h-4 text-emerald-600" />
//                     ) : (
//                       <Copy className="w-4 h-4" />
//                     )}
//                   </button>
//                 </div>

//                 <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
//                   <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
//                   <p className="text-xs text-blue-700 dark:text-blue-300">
//                     Use this URL when configuring webhooks in {provider.name}. All events will be received and tracked here.
//                   </p>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Test Webhook */}
//             <motion.div
//               variants={fadeUp}
//               initial="hidden"
//               animate="show"
//               className="rounded-xl border border-border bg-card p-6"
//             >
//               <div className="flex items-center gap-2 mb-4">
//                 <Send className="w-5 h-5 text-primary" />
//                 <h2 className="text-lg font-semibold">Test Webhook</h2>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">
//                     Select Event Type
//                   </label>
//                   <select
//                     value={selectedEvent}
//                     onChange={(e) => setSelectedEvent(e.target.value)}
//                     className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                   >
//                     {provider.webhooks.map((webhook) => (
//                       <option key={webhook.event} value={webhook.event}>
//                         {webhook.event}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <button
//                   onClick={handleTestWebhook}
//                   disabled={testStatus === "sending"}
//                   className={`
//                     w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
//                     ${testStatus === "success"
//                       ? "bg-emerald-500 hover:bg-emerald-600 text-white"
//                       : testStatus === "error"
//                       ? "bg-rose-500 hover:bg-rose-600 text-white"
//                       : "bg-primary hover:bg-primary/90 text-primary-foreground"
//                     }
//                     disabled:opacity-50 disabled:cursor-not-allowed
//                   `}
//                 >
//                   {testStatus === "sending" && (
//                     <>
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       Sending...
//                     </>
//                   )}
//                   {testStatus === "success" && (
//                     <>
//                       <CheckCircle2 className="w-4 h-4" />
//                       Test Sent Successfully!
//                     </>
//                   )}
//                   {testStatus === "error" && (
//                     <>
//                       <XCircle className="w-4 h-4" />
//                       Failed to Send
//                     </>
//                   )}
//                   {testStatus === "idle" && (
//                     <>
//                       <Send className="w-4 h-4" />
//                       Send Test Event
//                     </>
//                   )}
//                 </button>

//                 {testStatus === "success" && (
//                   <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
//                     <p className="text-sm text-emerald-700 dark:text-emerald-300">
//                       Test webhook sent! Check your events page to see it.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           </div>

//           {/* Right Column */}
//           <div className="space-y-6">
//             {/* Available Events */}
//             <motion.div
//               variants={fadeUp}
//               initial="hidden"
//               animate="show"
//               className="rounded-xl border border-border bg-card p-6"
//             >
//               <h2 className="text-lg font-semibold mb-4">Available Events</h2>

//               <div className="space-y-2">
//                 {provider.webhooks.map((webhook) => (
//                   <div
//                     key={webhook.event}
//                     className="rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
//                   >
//                     <button
//                       onClick={() =>
//                         setShowPayload(showPayload === webhook.event ? null : webhook.event)
//                       }
//                       className="w-full flex items-start justify-between gap-3"
//                     >
//                       <div className="flex-1 text-left">
//                         <div className="flex items-center gap-2 mb-1">
//                           <code className="text-sm font-semibold text-primary">
//                             {webhook.event}
//                           </code>
//                         </div>
//                         <p className="text-xs text-muted-foreground">
//                           {webhook.description}
//                         </p>
//                       </div>
//                       {showPayload === webhook.event ? (
//                         <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
//                       ) : (
//                         <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
//                       )}
//                     </button>

//                     {/* Example Payload */}
//                     {showPayload === webhook.event && (
//                       <motion.div
//                         initial={{ opacity: 0, height: 0 }}
//                         animate={{ opacity: 1, height: "auto" }}
//                         exit={{ opacity: 0, height: 0 }}
//                         className="mt-3 pt-3 border-t border-border"
//                       >
//                         <p className="text-xs font-medium text-muted-foreground mb-2">
//                           Example Payload:
//                         </p>
//                         <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
//                           {JSON.stringify(webhook.examplePayload, null, 2)}
//                         </pre>
//                       </motion.div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             {/* Quick Stats */}
//             <motion.div
//               variants={fadeUp}
//               initial="hidden"
//               animate="show"
//               className="grid gap-4 sm:grid-cols-2"
//             >
//               <div className="rounded-lg border border-border bg-card p-4">
//                 <p className="text-sm text-muted-foreground mb-1">Total Events</p>
//                 <p className="text-2xl font-bold">{provider.webhooks.length}</p>
//               </div>
//               <div className="rounded-lg border border-border bg-card p-4">
//                 <p className="text-sm text-muted-foreground mb-1">Status</p>
//                 <p className="text-2xl font-bold">
//                   {isConnected ? (
//                     <span className="text-emerald-600 dark:text-emerald-400">Active</span>
//                   ) : (
//                     <span className="text-muted-foreground">Inactive</span>
//                   )}
//                 </p>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



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

type User = {
  email: string
  avatar_url?: string
}

type Integration = {
  webhook_token: string
}

/* ---------------- COMPONENT ---------------- */

export default function ProviderDetailClient({
  provider,
  isConnected,
  user,
}: {
  provider: Provider
  isConnected: boolean
  user: User
}) {
  const [copied, setCopied] = useState(false)
  const [integration, setIntegration] = useState<Integration | null>(null)
  const [selectedEvent, setSelectedEvent] = useState(
    provider.webhooks?.[0]?.event ?? ""
  )
  const [testStatus, setTestStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle")

  const webhookUrl = integration?.webhook_token
    ? `${process.env.NEXT_PUBLIC_API_URL}/webhook/${integration.webhook_token}`
    : ""

  /* ---------------- ACTIONS ---------------- */

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConnect = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/${provider.id}`, {
      method: "POST",
      credentials: "include",
    })

    const data = await res.json()

    setIntegration({
      webhook_token: data.webhook_url.split("/webhook/")[1],
    })
  }

  const handleDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect this integration?")) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/${provider.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      setIntegration(null)
    }
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
        body: JSON.stringify(selectedWebhook?.examplePayload),
      })

      setTestStatus("success")
    } catch {
      setTestStatus("error")
    }

    setTimeout(() => setTestStatus("idle"), 3000)
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <Link href="/integrations" className="text-sm text-muted-foreground">
            ← Back
          </Link>
          <div className="flex gap-3">
            <ThemeToggle />
            <UserNav user={user} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold">{provider.name}</h1>

        {/* Connect / Disconnect */}
        {integration ? (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 border border-red-500 text-red-600 rounded"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Connect
          </button>
        )}

        {/* Webhook URL */}
        {webhookUrl && (
          <div className="space-y-2">
            <p className="font-mono text-sm">{webhookUrl}</p>
            <button
              onClick={() => copyToClipboard(webhookUrl)}
              className="text-sm border px-3 py-1 rounded"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}

        {/* Event Selector */}
        <div>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            {provider.webhooks.map((webhook) => (
              <option key={webhook.event} value={webhook.event}>
                {webhook.event}
              </option>
            ))}
          </select>
        </div>

        {/* Test Button */}
        <button
          onClick={handleTestWebhook}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send Test
        </button>

        {/* Status */}
        <p>Status: {testStatus}</p>
      </div>
    </div>
  )
}