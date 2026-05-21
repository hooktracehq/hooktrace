export const dynamic =
  "force-dynamic"

import MetricsClient from "./metrics-client"

export default async function MetricsPage() {

  // TODO:
  // Replace with Prometheus APIs later

  const throughputData = [
    {
      time: "12:00",
      events: 120,
    },
    {
      time: "12:05",
      events: 220,
    },
    {
      time: "12:10",
      events: 180,
    },
    {
      time: "12:15",
      events: 310,
    },
    {
      time: "12:20",
      events: 260,
    },
  ]

  const providerData = [
    {
      name: "GitHub",
      value: 400,
    },
    {
      name: "Stripe",
      value: 300,
    },
    {
      name: "Slack",
      value: 180,
    },
    {
      name: "Notion",
      value: 120,
    },
  ]

  const latencyData = [
    {
      time: "12:00",
      latency: 80,
    },
    {
      time: "12:05",
      latency: 110,
    },
    {
      time: "12:10",
      latency: 70,
    },
    {
      time: "12:15",
      latency: 140,
    },
    {
      time: "12:20",
      latency: 90,
    },
  ]

  return (
    <MetricsClient
      total={12482}
      failures={142}
      retries={91}
      latency={82}

      throughputData={
        throughputData
      }

      providerData={
        providerData
      }

      latencyData={
        latencyData
      }
    />
  )
}