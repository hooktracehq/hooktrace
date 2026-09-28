# Introduction

HookTrace is an open-source webhook infrastructure platform for receiving, inspecting, delivering, retrying, and replaying webhooks.

It gives developers a self-hostable place to understand what happens to a webhook after it leaves a provider and before it reaches an application.

## What HookTrace does

A typical webhook flow looks like this:

```text
Webhook Provider
      │
      ▼
  HookTrace
      │
      ├── Store event
      ├── Inspect payload
      ├── Queue delivery
      ├── Retry failures
      └── Replay events
              │
              ▼
       Your Application
```

HookTrace separates webhook ingestion from delivery work so incoming events can be inspected and processed asynchronously.

## Core capabilities

### Receive webhooks

HookTrace exposes webhook routes that external providers can send events to.

### Inspect events

Received events can be inspected from the dashboard, including request information, delivery state, attempts, errors, and timestamps.

### Deliver events

HookTrace forwards events to configured delivery targets.

### Retry failed deliveries

When a delivery fails, the worker can retry the event according to the configured retry behavior.

### Replay events

Previously received events can be replayed through the normal delivery pipeline.

### Real-time updates

The dashboard uses WebSockets and Redis Pub/Sub to stream event activity in real time.

### Development tunnels

HookTrace includes development tunnels for exposing local applications to webhook providers while building locally.

### Metrics

The API exposes Prometheus metrics for monitoring HookTrace alongside the rest of your infrastructure.

## Architecture

HookTrace is composed of several services:

| Component      | Technology | Purpose                                     |
| -------------- | ---------- | ------------------------------------------- |
| API            | FastAPI    | HTTP API and webhook ingestion              |
| Dashboard      | Next.js    | Web interface for events and infrastructure |
| Database       | PostgreSQL | Persistent application and event data       |
| Queue / PubSub | Redis      | Background processing and real-time updates |
| Worker         | Python     | Delivery, retries, and background jobs      |
| Tunnels        | Python     | Local webhook development                   |
| Metrics        | Prometheus | Application metrics                         |

The repository also includes supporting infrastructure for Kafka, RabbitMQ, LocalStack, Grafana, and the gRPC test server.

## Core concepts

* **Route** — an endpoint that receives webhook traffic.
* **Event** — a webhook request received through a route.
* **Delivery target** — a destination configured to receive events.
* **Delivery** — an attempt to send an event to a target.
* **Replay** — sending a previously received event through the delivery pipeline again.
* **Tunnel** — a development endpoint that connects a public HookTrace URL to a local application.

## Authentication

The API supports local email/password registration and login, along with Google and GitHub OAuth when those providers are configured.

Authenticated API operations use the user's access token. The API also supports Bearer authentication for authenticated requests.

## Self-hosting

HookTrace is designed to be self-hosted. You can run the development stack with Docker Compose and run the Next.js dashboard separately.

## Open source

HookTrace is licensed under the Apache License 2.0.

You can inspect the source, run it on your own infrastructure, modify it, and contribute improvements.

## Next steps

* [Quickstart](./quickstart.md) — run HookTrace locally and open the dashboard.
* Concepts — understand routes, events, deliveries, retries, replay, and tunnels.
* Self-hosting — configure HookTrace for your own infrastructure.
* API — integrate HookTrace into your applications.
