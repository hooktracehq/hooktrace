# Tunnels API

Tunnels provide a development workflow for exposing a local webhook
endpoint through a HookTrace-managed public URL.

The API is exposed under:

``` text
/tunnels
```

## Endpoints

The current tunnel API exposes:

``` text
GET    /tunnels
POST   /tunnels
GET    /tunnels/{tunnel_id}
PATCH  /tunnels/{tunnel_id}
DELETE /tunnels/{tunnel_id}
GET    /tunnels/{tunnel_id}/logs
GET    /tunnels/{tunnel_id}/stats
```

All tunnel management operations require authentication.

## List tunnels

``` http
GET /tunnels
Authorization: Bearer <jwt>
```

Returns tunnels belonging to the authenticated user.

## Create a tunnel

``` http
POST /tunnels
Authorization: Bearer <jwt>
Content-Type: application/json
```

The tunnel creation request includes the local URL that should receive
forwarded traffic.

The resulting tunnel contains values such as:

``` json
{
  "id": "<tunnel-id>",
  "name": "my-local-app",
  "localUrl": "http://localhost:4000",
  "publicUrl": "<public-url>",
  "token": "<tunnel-token>",
  "status": "offline",
  "createdAt": "<timestamp>",
  "lastUsed": null,
  "requestCount": 0
}
```

The exact public URL format depends on the tunnel deployment
configuration.

## Get a tunnel

``` http
GET /tunnels/{tunnel_id}
Authorization: Bearer <jwt>
```

Returns the current configuration and status for the selected tunnel.

## Update a tunnel

``` http
PATCH /tunnels/{tunnel_id}
Authorization: Bearer <jwt>
Content-Type: application/json
```

The current implementation supports updating fields such as:

-   `name`
-   `local_url`
-   `status`

## Delete a tunnel

``` http
DELETE /tunnels/{tunnel_id}
Authorization: Bearer <jwt>
```

A successful deletion returns:

``` json
{
  "success": true
}
```

## Tunnel logs

``` http
GET /tunnels/{tunnel_id}/logs
Authorization: Bearer <jwt>
```

The endpoint accepts a `limit` query parameter and returns recent tunnel
requests.

Example:

``` text
GET /tunnels/<tunnel-id>/logs?limit=50
```

Log entries can include:

-   request ID
-   HTTP method
-   path
-   status code
-   duration
-   provider
-   event type
-   request headers
-   request body
-   response status
-   response body
-   error
-   timestamp

## Tunnel statistics

``` http
GET /tunnels/{tunnel_id}/stats
Authorization: Bearer <jwt>
```

Statistics include aggregate values such as:

-   total requests
-   successful requests
-   errors
-   average duration

Example response shape:

``` json
{
  "total": 42,
  "success": 39,
  "errors": 3,
  "avgDuration": 84
}
```

## Tunnel workflow

A typical local-development flow is:

``` text
Local application
      ↓
HookTrace tunnel
      ↓
Public tunnel URL
      ↓
Webhook provider
```

Use tunnels for development and debugging. Production webhook endpoints
should normally use a stable deployed HookTrace route rather than a
developer's local machine.
