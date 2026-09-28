# HookTrace

**Open-source webhook infrastructure for receiving, inspecting, delivering, retrying, and replaying webhooks.**

HookTrace gives developers a self-hostable place to see what happens to their webhooks — from the moment an event arrives to the moment it reaches your application.

Built for developers who need more visibility and control than a simple webhook endpoint provides.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/hooktracehq/hooktrace/actions/workflows/ci.yml/badge.svg)](https://github.com/hooktracehq/hooktrace/actions/workflows/ci.yml)

---

## Why HookTrace?

Webhooks are simple until something goes wrong.

A provider sends an event.

Your application doesn't receive it.

Or it receives it twice.

Or your endpoint returns `500`.

Or a downstream service is temporarily unavailable.

Or you need to understand exactly what payload was sent three hours ago.

**HookTrace provides the infrastructure and visibility around those events.**

### With HookTrace you can

* Receive webhooks through managed routes
* Inspect webhook payloads and headers
* Track delivery status
* Retry failed deliveries
* Replay events
* Send events to configurable delivery targets
* Monitor webhook activity
* Stream events to the dashboard in real time
* Run webhook tunnels during local development
* Connect integrations
* Monitor system metrics with Prometheus
* Self-host the entire stack

---

## Architecture

HookTrace is built as a small set of services that work together:

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
              │   Events    │    │   Queues    │
              │   Routes    │    │   Pub/Sub   │
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
| Worker         | Python     | Delivery, retries and background jobs      |
| Tunnels        | Python     | Local webhook development                  |
| Metrics        | Prometheus | Application metrics                        |

---

## Features

### Webhook ingestion

Create routes that receive webhook requests from external services.

HookTrace records the relevant event information so you can inspect and process it asynchronously.

### Event inspection

Inspect:

* Request payloads
* Headers
* Provider
* Event type
* Delivery status
* Attempt count
* Errors
* Timestamps

### Delivery

Configure delivery targets and forward incoming events to your application.

### Retries

Failed deliveries can be retried according to the configured retry behavior.

This helps protect your integration from temporary downstream failures.

### Replay

Replay previously received events when you need to test an endpoint, recover from a failure, or reproduce an integration problem.

### Real-time dashboard

HookTrace uses WebSockets and Redis Pub/Sub to provide real-time event updates to the dashboard.

### Dead-letter handling

Events that cannot successfully complete delivery can be surfaced as failed/dead-letter events for investigation and recovery.

### Local development tunnels

Use HookTrace tunnels to expose local development endpoints to webhook providers without deploying your application first.

### Integrations

HookTrace is designed to work with webhook-producing services and provides an integration layer for provider-specific functionality.

### Observability

HookTrace exposes Prometheus metrics so you can monitor the webhook infrastructure alongside the rest of your stack.

---

# Quick Start

## Requirements

Before running HookTrace locally, install:

* Git
* Docker
* Docker Compose
* Node.js
* Python

PostgreSQL and Redis can be run through the provided Docker setup.

---

## 1. Clone the repository

```bash
git clone https://github.com/hooktracehq/hooktrace.git
cd hooktrace
```

---

## 2. Configure environment variables

Create your local environment configuration from the example file:

```bash
cp .env.example .env
```

Then configure the required values.

> **Important:** Never commit real credentials, API keys, OAuth secrets, database passwords, or production tokens to the repository.

---

## 3. Start the infrastructure

```bash
docker compose up -d
```

---

## 4. Start the API

From the project root:

```bash
cd services
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI application:

```bash
uvicorn api.main:app --reload
```

The API should now be available at:

```text
http://localhost:8000
```

---

## 5. Start the web application

In another terminal:

```bash
cd web
npm install
npm run dev
```

The dashboard will be available at:

```text
http://localhost:3000
```

---

# Your First Webhook

The basic HookTrace flow is:

```text
Provider
   │
   ▼
HookTrace Route
   │
   ├── Store event
   │
   ├── Queue delivery
   │
   ▼
Worker
   │
   ▼
Your endpoint
```

Create a route in the dashboard, then configure your webhook provider to send events to the generated HookTrace endpoint.

Once an event arrives, you can inspect it from the dashboard and follow its delivery lifecycle.

For a complete walkthrough, see:

[**Getting Started →**](docs/getting-started/installation.md)

---

# Self-Hosting

HookTrace is designed to run on infrastructure you control.

You can self-host the complete stack using Docker and the project's deployment configuration.

Common deployment targets include:

* Docker
* Railway
* Render
* Kubernetes
* Your own VPS or cloud infrastructure

See the deployment documentation:

[**Self-Hosting Guide →**](docs/deployment/docker.md)

---

# Project Structure

```text
hooktrace/
│
├── services/
│   ├── api/          # FastAPI application
│   ├── worker/       # Background delivery workers
│   ├── tunnels/      # Local development tunnels
│   ├── cli/          # CLI tooling
│   └── shared/       # Shared service code
│
├── web/              # Next.js dashboard
│
├── docs/             # Documentation
│
├── .github/          # CI and contribution templates
│
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

# Development

HookTrace is actively developed and welcomes contributions.

If you're interested in working on the project:

1. Fork the repository.
2. Create a branch.
3. Make your changes.
4. Run the relevant tests and checks.
5. Open a pull request.

See:

[**Contributing →**](CONTRIBUTING.md)

---

# Roadmap

The project is evolving toward a complete open-source webhook infrastructure platform.

Areas of development include:

* Webhook ingestion
* Event inspection
* Delivery targets
* Retry processing
* Event replay
* Real-time dashboard updates
* Local development tunnels
* Prometheus metrics
* Integration system
* More provider integrations
* Improved deployment experience
* Expanded CLI functionality
* More comprehensive documentation
* Additional observability features

The roadmap is subject to change as the project develops.

---

# Contributing

There are many ways to contribute:

* Report bugs
* Improve documentation
* Add integrations
* Improve the dashboard
* Improve delivery reliability
* Add tests
* Improve deployment tooling
* Suggest features
* Submit pull requests

Please read the contribution guidelines before opening a pull request.

---

# Security

If you discover a security vulnerability, please avoid opening a public issue with sensitive details.

See the project's security policy for responsible disclosure instructions.

[**Security Policy →**](SECURITY.md)

---

# License

HookTrace is open source and licensed under the **Apache License 2.0**.

See [LICENSE](LICENSE) for the complete license text.

---

## Built for developers

HookTrace exists to make webhook infrastructure easier to understand, debug, and operate.

**Receive. Inspect. Deliver. Retry. Replay.**

Self-host it, modify it, and build on top of it.

[GitHub](https://github.com/hooktracehq/hooktrace)
