# HookTrace

**Open-source webhook infrastructure for receiving, inspecting, delivering, retrying, and replaying webhooks.**

HookTrace gives developers a self-hostable control plane for webhook traffic — from the moment an event arrives to the moment it reaches a downstream application.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/hooktracehq/hooktrace/actions/workflows/ci.yml/badge.svg)](https://github.com/hooktracehq/hooktrace/actions/workflows/ci.yml)

**[Documentation](docs/README.md) · [Quickstart](docs/quickstart.md) · [API](docs/api/introduction.md) · [Contributing](docs/development/contributing.md)**

---

## Why HookTrace?

Webhooks are easy until something fails.

A provider sends an event, your endpoint returns `500`, a downstream service goes offline, an event arrives twice, or you need to understand what happened hours later.

HookTrace gives you the infrastructure and visibility around those events.

### The core workflow

```text
Webhook Provider
       │
       ▼
   HookTrace
       │
       ├── Receive
       ├── Inspect
       ├── Store
       ├── Queue
       ├── Deliver
       ├── Retry
       └── Replay
              │
              ▼
       Your Application
```

## What you can do

* Receive webhooks through configurable routes
* Inspect payloads, headers, provider, and event type
* Configure delivery targets
* Track delivery activity and failures
* Retry failed deliveries
* Replay previously received events
* Use development tunnels for local webhook testing
* Connect provider-specific integrations
* Monitor infrastructure with Prometheus
* Self-host the complete stack

---

## Architecture

```text
                     ┌──────────────────┐
                     │ Webhook Provider │
                     │ Stripe / GitHub  │
                     │ Razorpay / etc.  │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │   HookTrace API  │
                     │     FastAPI      │
                     └────────┬─────────┘
                              │
                     ┌────────┴─────────┐
                     │                  │
                     ▼                  ▼
              ┌─────────────┐    ┌─────────────┐
              │ PostgreSQL  │    │    Redis    │
              │ Events      │    │ Queues      │
              │ Routes      │    │ Pub/Sub     │
              └─────────────┘    └──────┬──────┘
                                        │
                                        ▼
                                ┌────────────────┐
                                │ Worker Service │
                                │ Delivery/Retry │
                                └───────┬────────┘
                                        │
                                        ▼
                                ┌─────────────────┐
                                │ Your Application│
                                └─────────────────┘

                         ▲
                         │
                  ┌──────┴───────┐
                  │    Next.js   │
                  │   Dashboard  │
                  └──────────────┘
```

### Core components

| Component      | Technology | Purpose                                    |
| -------------- | ---------- | ------------------------------------------ |
| API            | FastAPI    | HTTP API and webhook ingestion             |
| Dashboard      | Next.js    | Event and infrastructure UI                |
| Database       | PostgreSQL | Persistent application and event data      |
| Queue / PubSub | Redis      | Background processing and realtime updates |
| Worker         | Python     | Delivery and background processing         |
| Tunnels        | Python     | Local webhook development                  |
| Metrics        | Prometheus | Application metrics                        |

---

# Quickstart

## Requirements

Install:

* Git
* Docker
* Docker Compose
* Node.js
* Python 3.11+

PostgreSQL and Redis are provided by the Docker stack.

## 1. Clone

```bash
git clone https://github.com/hooktracehq/hooktrace.git
cd hooktrace
```

## 2. Configure environment

```bash
cp .env.example .env
```

Review the values before starting the stack.

**Never commit real credentials, OAuth secrets, API keys, database passwords, or production tokens.**

## 3. Start the backend stack

```bash
docker compose up -d
```

Check the API:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{"status":"ok"}
```

Open the FastAPI documentation:

```text
http://localhost:3001/docs
```

## 4. Start the dashboard

In another terminal:

```bash
cd web
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

For a more detailed setup, see the [Quickstart guide](docs/quickstart.md).

---

# Documentation

The complete documentation is organized around the actual HookTrace workflow.

### Guide

* [Introduction](docs/introduction.md)
* [Quickstart](docs/quickstart.md)
* [Concepts](docs/concepts/overview.md)

### Self-hosting

* [Overview](docs/self-hosting/overview.md)
* [Docker](docs/self-hosting/docker.md)
* [Environment](docs/self-hosting/environment.md)

### API

* [API Introduction](docs/api/introduction.md)
* [Authentication](docs/api/authentication.md)
* [Routes](docs/api/routes.md)
* [Events](docs/api/events.md)
* [Deliveries](docs/api/deliveries.md)
* [Replay](docs/api/replay.md)
* [Tunnels](docs/api/tunnels.md)

### Integrations

* [Overview](docs/integrations/overview.md)
* [Stripe](docs/integrations/stripe.md)
* [GitHub](docs/integrations/github.md)
* [Razorpay](docs/integrations/razorpay.md)
* [Custom Webhooks](docs/integrations/custom-webhooks.md)

### Development

* [Local Development](docs/development/local-development.md)
* [Project Structure](docs/development/project-structure.md)
* [Testing](docs/development/testing.md)
* [Contributing](docs/development/contributing.md)

### Troubleshooting

* [Common Issues](docs/troubleshooting/common-issues.md)
* [Authentication](docs/troubleshooting/authentication.md)
* [Deliveries](docs/troubleshooting/deliveries.md)
* [Tunnels](docs/troubleshooting/tunnels.md)
* [Deployment](docs/troubleshooting/deployment.md)

---

# Self-hosting

HookTrace is designed to run on infrastructure you control.

The primary local/self-hosting path is Docker Compose.

```bash
docker compose up -d
```

See the [self-hosting documentation](docs/self-hosting/overview.md) for configuration and deployment guidance.

---

# Project Structure

```text
hooktrace/
├── services/
│   ├── api/          # FastAPI application
│   ├── worker/       # Background delivery workers
│   ├── tunnels/      # Local development tunnel services
│   └── shared/      # Shared service code
├── web/              # Next.js dashboard
├── docs/             # Documentation
├── .github/          # CI and contribution configuration
├── docker-compose.yml
├── .env.example
├── LICENSE
└── README.md
```

---

# Development

HookTrace is open source and welcomes contributions.

For local development, testing, repository structure, and contribution workflow:

**[Read the Development Guide →](docs/development/local-development.md)**

---

# Security

Please do not publish sensitive vulnerability details in a public issue.

See [SECURITY.md](SECURITY.md) for the project's security policy.

---

# License

HookTrace is licensed under the **Apache License 2.0**.

See [LICENSE](LICENSE).

---

## Built for developers

HookTrace exists to make webhook infrastructure easier to understand, debug, and operate.

**Receive. Inspect. Deliver. Retry. Replay.**

Self-host it, modify it, and build on top of it.

**[Documentation →](docs/README.md)**
