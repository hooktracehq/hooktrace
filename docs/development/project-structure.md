# Project Structure

HookTrace is organized as a multi-service application with a Next.js web dashboard and Python backend services.

The repository contains the application code, infrastructure configuration, and supporting development resources.

## High-level structure

The main directories include:

```text
hooktrace/
├── web/
├── services/
├── docs/
├── docker-compose.yml
├── .env.example
└── README.md
```

## Web

The `web/` directory contains the HookTrace frontend.

It is built with Next.js and provides the dashboard used to interact with the HookTrace API.

Typical responsibilities include:

- Authentication UI
- Route management
- Event inspection
- Delivery visibility
- Tunnel management
- Dashboard views

The web application is developed independently from the backend services.

## Services

The `services/` directory contains the backend and worker components.

The API is implemented with FastAPI.

The repository also contains worker and supporting service code used for background processing.

A simplified view is:

```text
services/
├── api/
├── worker/
└── ...
```

The exact service list can evolve as HookTrace develops.

## API

The API provides the HTTP interface used by the frontend and external clients.

The API includes functionality for areas such as:

- Authentication
- Routes
- Events
- Deliveries
- Replay
- Tunnels
- Health checks

The API is exposed on port `3001` in the standard local development configuration.

## Worker

The worker handles asynchronous processing.

Webhook delivery should not depend entirely on the synchronous API request lifecycle, so background workers process queued work.

The worker uses the configured database and Redis infrastructure.

## PostgreSQL

PostgreSQL provides persistent storage.

It stores application data required by HookTrace.

For local development, PostgreSQL is provided through Docker Compose.

## Redis

Redis provides queueing and background-processing infrastructure.

It connects the API and worker portions of the application for asynchronous processing.

## Docker Compose

`docker-compose.yml` defines the local service environment.

It provides the infrastructure required to run HookTrace and its supporting services together.

Use:

```bash
docker compose up -d --build
```

to start the development environment.

## Documentation

The `docs/` directory contains the project documentation.

The documentation is organized by topic:

```text
docs/
├── concepts/
├── self-hosting/
├── integrations/
├── troubleshooting/
├── development/
└── api/
```

## Configuration

`.env.example` documents the environment variables used by the project.

A local developer creates a private `.env` file from that example:

```text
.env.example
     │
     ▼
   .env
```

The `.env` file should not be committed.

## Where to make changes

Use the area that matches the change:

| Change | Location |
|---|---|
| Dashboard UI | `web/` |
| API behavior | `services/api/` |
| Background processing | `services/worker/` |
| Docker/service configuration | `docker-compose.yml` |
| Environment documentation | `.env.example` |
| Documentation | `docs/` |

Always inspect the existing implementation before introducing new abstractions or configuration.

## Following a request through the system

A simplified webhook flow is:

```text
Webhook Provider
       │
       ▼
     API
       │
       ▼
     Event
       │
       ▼
     Redis
       │
       ▼
    Worker
       │
       ▼
Destination
```

This model helps identify where a change belongs.

For example:

- Request handling → API
- Queue processing → Worker/Redis
- Persistent state → PostgreSQL
- User interface → Web
- Deployment → Docker/Compose

## Next steps

- [Local Development](./local-development.md)
- [Testing](./testing.md)
- [Contributing](./contributing.md)
