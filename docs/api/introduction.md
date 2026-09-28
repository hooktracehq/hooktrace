# API Introduction

HookTrace exposes an HTTP API for managing webhook routes, receiving
webhook events, inspecting delivery targets, replaying events, and
managing development tunnels.

The API is served by the FastAPI service. When running the default local
stack:

-   API base URL: `http://localhost:3001`
-   Health check: `GET /health`
-   Interactive API documentation: `http://localhost:3001/docs`

> **Implementation note:** This guide documents the API surface
> currently present in the HookTrace backend. Some operational or
> internal behavior may evolve as the OSS project matures.

## API areas

  -----------------------------------------------------------------------
  Area                                Purpose
  ----------------------------------- -----------------------------------
  Authentication                      Register, sign in, sign out, OAuth,
                                      and identify the current user

  Routes                              Create and manage webhook routes
                                      and their delivery targets

  Webhook ingestion                   Receive provider or generic webhook
                                      requests

  Events                              Replay previously received events

  Delivery targets                    Inspect, test, and manage
                                      destinations

  Tunnels                             Create development tunnels and
                                      inspect tunnel traffic
  -----------------------------------------------------------------------

## Base URL

For local development:

``` text
http://localhost:3001
```

For a self-hosted deployment, replace the host with the address where
the HookTrace API is exposed.

## Authentication

Management endpoints use the authenticated user context. HookTrace
accepts authentication through:

``` http
Authorization: Bearer <access_token>
```

The API also supports the `access_token` HTTP cookie set by the
authentication endpoints.

Webhook ingestion endpoints are different: a webhook sender uses the
route token and route path rather than a dashboard JWT.

See [Authentication](./authentication.md) for details.

## Health check

``` http
GET /health
```

Example response:

``` json
{
  "status": "ok"
}
```

## Interactive documentation

FastAPI exposes interactive API documentation from the running service.
For a local installation, open:

``` text
http://localhost:3001/docs
```

Use the generated OpenAPI interface as the authoritative reference for
the exact request and response schemas exposed by the running version of
HookTrace.
