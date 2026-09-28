# Quickstart

This guide gets a local HookTrace installation running with Docker Compose and the Next.js dashboard.

## Prerequisites

Install:

* Git
* Docker Desktop with Docker Compose
* Node.js
* Python 3.11+

You do not need to install PostgreSQL or Redis separately when using the provided Docker Compose stack.

## 1. Clone HookTrace

```bash
git clone https://github.com/hooktracehq/hooktrace.git
cd hooktrace
```

## 2. Configure the environment

Create a local environment file from the example.

### macOS / Linux

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

For local development, the defaults in `.env.example` are intended to provide a starting point.

> Never commit real passwords, API keys, OAuth secrets, or production credentials.

If you enable Google or GitHub OAuth, configure the corresponding OAuth variables in your local environment.

## 3. Start the backend stack

From the repository root:

```bash
docker compose up -d --build
```

This starts the API and background services, including PostgreSQL and Redis.

Check the service status:

```bash
docker compose ps
```

The API should report as healthy, and the worker services should be running.

## 4. Verify the API

The local API runs on port `3001`.

### macOS / Linux

```bash
curl http://localhost:3001/health
```

### Windows PowerShell

```powershell
curl.exe http://localhost:3001/health
```

Expected response:

```json
{"status":"ok"}
```

You can also open the API documentation at:

```text
http://localhost:3001/docs
```

## 5. Start the dashboard

Open a second terminal:

```bash
cd web
npm install
npm run dev
```

The dashboard will be available at:

```text
http://localhost:3000
```

The dashboard uses the local API at:

```text
http://localhost:3001
```

If your local configuration uses a different API URL, set `NEXT_PUBLIC_API_URL` in `web/.env.local`.

## 6. Create an account

Open:

```text
http://localhost:3000
```

Create an account using the registration flow, or use a configured OAuth provider.

Once authenticated, open the dashboard.

## 7. Create a webhook route

Create a route from the dashboard.

A route has a name and a mode. It can optionally have development and production delivery targets.

After creating the route, HookTrace provides the route token and webhook endpoint information needed to send traffic to it.

## 8. Send a test webhook

Use your generated webhook endpoint with a simple POST request.

For example:

```bash
curl -X POST "<YOUR_HOOKTRACE_WEBHOOK_URL>" \
  -H "Content-Type: application/json" \
  -d '{"event":"test.webhook","message":"hello from HookTrace"}'
```

On Windows PowerShell:

```powershell
curl.exe -X POST "<YOUR_HOOKTRACE_WEBHOOK_URL>" `
  -H "Content-Type: application/json" `
  -d '{"event":"test.webhook","message":"hello from HookTrace"}'
```

The exact generated URL depends on the route configuration.

## 9. Inspect the event

Open the dashboard and inspect the newly received event.

The event lifecycle is:

```text
Request
  │
  ▼
HookTrace route
  │
  ▼
Event stored
  │
  ▼
Worker queue
  │
  ▼
Delivery target
```

From the dashboard you can inspect the event and its delivery state.

## 10. Stop the backend stack

When you are finished:

```bash
docker compose down
```

To remove the containers and their associated volumes:

```bash
docker compose down -v
```

> The `-v` option removes persisted PostgreSQL, Redis, Grafana, and LocalStack data created by the Compose stack. Use it only when you want to reset local state.

## Troubleshooting

### API is not healthy

Check the API logs:

```bash
docker compose logs --tail=100 api
```

### Worker is restarting

Check the worker logs:

```bash
docker compose logs --tail=100 worker
```

For the aggregation worker:

```bash
docker compose logs --tail=100 aggregation-worker
```

### Dashboard cannot connect to the API

Confirm the API is available:

```text
http://localhost:3001/health
```

Then check `NEXT_PUBLIC_API_URL` in `web/.env.local`.

### Port already in use

The default local ports include:

| Service             |  Port |
| ------------------- | ----: |
| Dashboard           |  3000 |
| API                 |  3001 |
| PostgreSQL          |  5433 |
| Redis               |  6379 |
| Grafana             |  3005 |
| Prometheus          |  9090 |
| RabbitMQ            |  5672 |
| RabbitMQ Management | 15672 |
| Kafka               |  9092 |
| gRPC test server    | 50051 |
| LocalStack          |  4566 |

If one is already in use, stop the conflicting process or adjust the corresponding local configuration.

## What's next?

After the quickstart, continue with:

* Concepts — learn how HookTrace models routes, events, deliveries, retries, replay, and tunnels.
* Self-hosting — configure HookTrace for a deployment environment.
* API — integrate HookTrace programmatically.
* Integrations — configure provider-specific webhook workflows.
* Development — understand the repository and contribute changes.
