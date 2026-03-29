// import { getCurrentUser } from "@/lib/auth"
// import { redirect } from "next/navigation"
// import DeliveryTargetsClient from "./delivery-targets-client"

// // Target types configuration
// const TARGET_TYPES = [
//   {
//     id: "http",
//     name: "HTTP Endpoint",
//     description: "Send webhooks to any HTTP/HTTPS URL",
//     icon: "🌐",
//     color: "bg-blue-500",
//     configFields: [
//       { name: "url", label: "Endpoint URL", type: "text", placeholder: "https://api.example.com/webhook", required: true },
//       { name: "method", label: "HTTP Method", type: "select", options: ["POST", "PUT", "PATCH"], required: true },
//       { name: "headers", label: "Custom Headers", type: "json", placeholder: '{"Authorization": "Bearer token"}', required: false },
//       { name: "timeout", label: "Timeout (seconds)", type: "number", placeholder: "30", required: false },
//     ],
//   },
//   {
//     id: "sqs",
//     name: "AWS SQS",
//     description: "Publish webhooks to an SQS queue",
//     icon: "📬",
//     color: "bg-orange-500",
//     configFields: [
//       { name: "queueUrl", label: "Queue URL", type: "text", placeholder: "https://sqs.us-east-1.amazonaws.com/...", required: true },
//       { name: "region", label: "AWS Region", type: "select", options: ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"], required: true },
//       { name: "accessKeyId", label: "Access Key ID", type: "text", placeholder: "AKIA...", required: true },
//       { name: "secretAccessKey", label: "Secret Access Key", type: "password", placeholder: "••••••••", required: true },
//       { name: "messageGroupId", label: "Message Group ID", type: "text", placeholder: "webhook-group", required: false },
//     ],
//   },
//   {
//     id: "kafka",
//     name: "Apache Kafka",
//     description: "Stream webhooks to a Kafka topic",
//     icon: "📊",
//     color: "bg-purple-500",
//     configFields: [
//       { name: "brokers", label: "Broker URLs", type: "text", placeholder: "localhost:9092,localhost:9093", required: true },
//       { name: "topic", label: "Topic Name", type: "text", placeholder: "webhooks", required: true },
//       { name: "clientId", label: "Client ID", type: "text", placeholder: "hooktrace-client", required: false },
//       { name: "saslMechanism", label: "SASL Mechanism", type: "select", options: ["PLAIN", "SCRAM-SHA-256", "SCRAM-SHA-512"], required: false },
//       { name: "username", label: "Username", type: "text", placeholder: "kafka-user", required: false },
//       { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: false },
//     ],
//   },
//   {
//     id: "webhook",
//     name: "Custom Webhook",
//     description: "Send to a custom webhook with transformations",
//     icon: "🔗",
//     color: "bg-emerald-500",
//     configFields: [
//       { name: "url", label: "Webhook URL", type: "text", placeholder: "https://hooks.example.com/custom", required: true },
//       { name: "secret", label: "Signing Secret", type: "password", placeholder: "••••••••", required: false },
//       { name: "transform", label: "Payload Transform", type: "json", placeholder: '{"event": "{{event}}", "data": "{{data}}"}', required: false },
//       { name: "retries", label: "Max Retries", type: "number", placeholder: "3", required: false },
//     ],
//   },
//   {
//     id: "email",
//     name: "Email Notification",
//     description: "Receive webhook events via email",
//     icon: "📧",
//     color: "bg-pink-500",
//     configFields: [
//       { name: "recipients", label: "Email Recipients", type: "text", placeholder: "admin@example.com, dev@example.com", required: true },
//       { name: "subject", label: "Subject Template", type: "text", placeholder: "[{{provider}}] {{event}}", required: false },
//       { name: "includePayload", label: "Include Payload", type: "checkbox", required: false },
//     ],
//   },
//   {
//     id: "slack",
//     name: "Slack Channel",
//     description: "Post webhook events to Slack",
//     icon: "💬",
//     color: "bg-purple-600",
//     configFields: [
//       { name: "webhookUrl", label: "Slack Webhook URL", type: "text", placeholder: "https://hooks.slack.com/services/...", required: true },
//       { name: "channel", label: "Channel", type: "text", placeholder: "#webhooks", required: false },
//       { name: "username", label: "Bot Username", type: "text", placeholder: "HookTrace Bot", required: false },
//       { name: "mentionOnError", label: "Mention on Error", type: "text", placeholder: "@channel", required: false },
//     ],
//   },
// ]

// export default async function DeliveryTargetsPage() {
//   const user = await getCurrentUser()
//   if (!user) redirect("/login")

//   // In production, fetch user's delivery targets from database
//   const deliveryTargets = [
//     {
//       id: "target-1",
//       name: "Production API",
//       type: "http",
//       config: {
//         url: "https://api.myapp.com/webhooks",
//         method: "POST",
//         headers: { "Authorization": "Bearer prod-token" },
//       },
//       enabled: true,
//       createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
//       lastUsed: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
//       successCount: 1247,
//       errorCount: 12,
//       providers: ["stripe", "github"],
//     },
//     {
//       id: "target-2",
//       name: "Analytics Queue",
//       type: "sqs",
//       config: {
//         queueUrl: "https://sqs.us-east-1.amazonaws.com/123456/analytics",
//         region: "us-east-1",
//       },
//       enabled: true,
//       createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
//       lastUsed: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
//       successCount: 892,
//       errorCount: 3,
//       providers: ["shopify", "stripe"],
//     },
//   ]

//   return (
//     <DeliveryTargetsClient
//       user={user}
//       deliveryTargets={deliveryTargets}
//       targetTypes={TARGET_TYPES}
//     />
//   )
// }





import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { apiFetch } from "@/lib/api"
import DeliveryTargetsClient from "./delivery-targets-client"
import { TARGET_TYPES } from "@/lib/constants/target-types"

export default async function DeliveryTargetsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  // Fetch real delivery targets from backend
  const res = await apiFetch('/delivery-targets')
  const deliveryTargets = res?.items || []

  return (
    <DeliveryTargetsClient
      user={user}
      deliveryTargets={deliveryTargets}
      targetTypes={TARGET_TYPES}
    />
  )
}