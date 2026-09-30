# HookTrace

**Open-source webhook infrastructure for developers.**

Receive, inspect, deliver, retry, and replay webhooks with a self-hostable stack built for visibility and control.

[Website](https://hooktrace.xyz) · [GitHub](https://github.com/hooktracehq/hooktrace) · [Documentation](https://github.com/hooktracehq/hooktrace/tree/main/docs) · [Security](https://github.com/hooktracehq/hooktrace/blob/main/SECURITY.md)

---

## Why HookTrace?

Webhooks are critical infrastructure, but debugging them can be painful.

A request arrives. A downstream service fails. A retry happens. Something gets lost. Then you're left searching through application logs trying to figure out what actually happened.

**HookTrace gives webhook events a place to live, inspect, retry, and replay.**

| Problem                                         | HookTrace                                        |
| ----------------------------------------------- | ------------------------------------------------ |
| Webhooks fail silently                          | Inspect received events and delivery attempts    |
| Downstream services go down                     | Retry failed deliveries                          |
| You need to debug production events             | Inspect payloads, headers, providers, and status |
| You need to reproduce an event                  | Replay it without triggering the provider again  |
| You need local webhook development              | Use tunnels to receive webhooks locally          |
| You need visibility into webhook infrastructure | Monitor metrics and delivery activity            |
| You want control over your infrastructure       | Self-host the entire stack                       |

---

## How It Works

```text
             Webhook Providers
                    │
                    ▼
            ┌───────────────┐
            │   HookTrace   │
            │      API      │
            └───────┬───────┘
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
     PostgreSQL    Redis     Workers
                              │
                              ▼
                       Delivery Targets
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                  Retry               Replay
```

HookTrace receives an event, stores the relevant information, processes delivery through background workers, and gives you visibility into what happened at each stage.

---

## Core Features

### Webhook Events

* Receive webhooks from providers
* Store incoming events
* Inspect payloads and headers
* Track providers and event metadata
* Monitor delivery status

### Delivery

* Configure delivery targets
* Process deliveries asynchronously
* Track delivery attempts
* Inspect responses and latency
* Retry failed deliveries

### Replay

Replay previously received events without asking the original provider to send them again.

Useful for:

* Debugging
* Recovering from downstream failures
* Testing changes
* Reprocessing events

### Local Tunnels

Receive real webhook requests on your local development environment without exposing your application directly to the public internet.

### Integrations

HookTrace supports provider-specific webhook workflows alongside generic webhook handling.

Current provider integrations include:

* Stripe
* GitHub
* Razorpay
* Shopify
* Slack
* Discord
* Notion
* Supabase
* Generic webhooks

See the [integration documentation](https://github.com/hooktracehq/hooktrace/tree/main/docs/integrations) for details.

### Observability

HookTrace includes metrics and monitoring capabilities for understanding webhook activity, delivery performance, failures, and retries.

---

## Self-Host

HookTrace is designed to run on your own infrastructure.

### Quick Start

```bash
git clone https://github.com/hooktracehq/hooktrace.git
cd hooktrace

cp .env.example .env

docker compose up -d
```

Once running:

| Service   | URL                          |
| --------- | ---------------------------- |
| Dashboard | `http://localhost:3000`      |
| API       | `http://localhost:3001`      |
| API Docs  | `http://localhost:3001/docs` |

For production and deployment options, see the [self-hosting documentation](https://github.com/hooktracehq/hooktrace/tree/main/docs/self-hosting).

---

## Architecture

HookTrace is built around a small set of services:

```text
                    ┌──────────────────┐
                    │ Webhook Providers │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   HookTrace API  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        PostgreSQL         Redis         Workers
              │                             │
              │                             ▼
              │                      Delivery Targets
              │                             │
              └──────────────┬──────────────┘
                             ▼
                       Dashboard
```

The stack includes:

* **FastAPI** API services
* **PostgreSQL** for persistent data
* **Redis** for queues and transient workloads
* **Background workers** for asynchronous processing
* **Next.js** dashboard
* **Webhook tunnels** for local development
* **Prometheus/Grafana** observability infrastructure

---

## Open Source

HookTrace is built in the open.

You can:

* Self-host it
* Inspect the source code
* Report bugs
* Request features
* Submit pull requests
* Build integrations
* Improve the documentation

Contributions are welcome.

See the [contributing guide](https://github.com/hooktracehq/hooktrace/blob/main/.github/CONTRIBUTING.md) to get started.

---

## Security

If you discover a security vulnerability, please **do not open a public issue**.

Follow the [HookTrace security policy](https://github.com/hooktracehq/hooktrace/blob/main/SECURITY.md) for private vulnerability reporting and responsible disclosure.

---

## Community

Have an idea, found a bug, or want to contribute?

* [GitHub Repository](https://github.com/hooktracehq/hooktrace)
* [Issues](https://github.com/hooktracehq/hooktrace/issues)
* [Discussions](https://github.com/hooktracehq/hooktrace/discussions)
* [Documentation](https://github.com/hooktracehq/hooktrace/tree/main/docs)

---

## License

HookTrace is released under the **Apache License 2.0**.

You can inspect, modify, self-host, and contribute to the project according to the terms of the license.
