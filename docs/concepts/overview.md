# Concepts

HookTrace is built around a simple webhook lifecycle:

```text
Webhook Provider
       │
       ▼
   HookTrace
       │
       ▼
     Event
       │
       ▼
   Delivery
       │
       ├── Success
       │
       └── Retry
              │
              └── Replay
```

This page introduces the core concepts used throughout HookTrace.

## Routes

A **route** defines where HookTrace receives a webhook and where that webhook can be delivered.

Routes provide the entry point for webhook traffic and can be configured with development or production targets.

A route can be used to:

* Receive incoming webhooks
* Associate incoming requests with a destination
* Separate development and production delivery targets
* Inspect events received through that route

See [Routes](./routes.md) for details.

## Events

An **event** represents a webhook received by HookTrace.

When a provider sends a webhook to HookTrace, the request becomes an event that can be inspected and tracked through its lifecycle.

An event contains information such as:

* Request payload
* HTTP method
* Headers
* Route
* Event identifier
* Processing status
* Delivery information
* Timestamps

Events provide the central record for understanding what happened to a webhook after it reached HookTrace.

See [Events](./events.md) for details.

## Deliveries

A **delivery** represents HookTrace sending an event to its configured destination.

The lifecycle is generally:

```text
Event received
      │
      ▼
Delivery queued
      │
      ▼
Destination receives request
      │
   ┌──┴──┐
   │     │
Success  Failure
   │     │
   │     ▼
   │    Retry
   │     │
   │     ▼
   │   Success
   │     │
   └─────┘
```

Delivery records make it possible to understand whether a webhook reached its destination and what happened during delivery.

See [Deliveries](./deliveries.md) for details.

## Retries

Webhook destinations can fail for many reasons: temporary outages, network failures, timeouts, or application errors.

HookTrace can retry failed deliveries according to its configured retry behavior.

Retries allow transient failures to recover without requiring you to manually resend the original webhook.

See [Retries](./retries.md) for details.

## Replay

**Replay** allows an existing event to be delivered again.

This is useful when:

* A destination was temporarily unavailable
* You fixed a problem in your receiving application
* You need to reproduce a webhook
* You want to resend an event without asking the original provider to send it again

Replay uses the existing event rather than requiring the provider to generate a new webhook.

See [Replay](./replay.md) for details.

## Tunnels

A **tunnel** connects local development environments to HookTrace.

This allows developers to work with webhook providers that normally require a publicly reachable URL while developing locally.

A typical development flow is:

```text
Webhook Provider
       │
       ▼
   HookTrace
       │
       ▼
     Tunnel
       │
       ▼
 Local Application
```

Tunnels are intended for development and testing workflows.

See [Tunnels](./tunnels.md) for details.

## Integrations

HookTrace can work with webhook-producing services such as Stripe, GitHub, and Razorpay.

Integrations provide provider-specific guidance while the underlying HookTrace workflow remains the same:

```text
Provider
   │
   ▼
HookTrace Route
   │
   ▼
 Event
   │
   ▼
Delivery
   │
   ▼
Your Application
```

Custom webhook providers can also be used when their webhook requests can be sent to a HookTrace route.

See [Integrations](./integrations.md) for details.

## The HookTrace lifecycle

Putting the concepts together:

### 1. Receive

A webhook provider sends an HTTP request to a HookTrace route.

### 2. Record

HookTrace records the incoming request as an event.

### 3. Queue

The event enters the delivery workflow.

### 4. Deliver

HookTrace sends the event to its configured destination.

### 5. Observe

You can inspect the event and its delivery status through the dashboard and API.

### 6. Retry

If delivery fails, HookTrace can retry the delivery according to its configured behavior.

### 7. Replay

An existing event can be replayed when you need to send it again.

### 8. Develop locally

With tunnels, webhook traffic can be forwarded to a local application during development.

## Where to go next

* [Routes](./routes.md) — configure webhook entry points and destinations
* [Events](./events.md) — understand received webhook events
* [Deliveries](./deliveries.md) — understand webhook delivery
* [Retries](./retries.md) — understand failed delivery handling
* [Replay](./replay.md) — resend existing events
* [Tunnels](./tunnels.md) — connect webhook traffic to local development
* [Integrations](./integrations.md) — work with webhook providers
