# Deliveries API

Delivery targets define where HookTrace sends processed webhook events.

The management API is exposed under:

``` text
/delivery-targets
```

## Endpoints

The current delivery-target API exposes:

``` text
GET    /delivery-targets
GET    /delivery-targets/stats
POST   /delivery-targets
GET    /delivery-targets/{target_id}
PATCH  /delivery-targets/{target_id}
DELETE /delivery-targets/{target_id}
POST   /delivery-targets/{target_id}/test
GET    /delivery-targets/{target_id}/logs
GET    /delivery-targets/{target_id}/stats
```

These management endpoints require authentication.

## List targets

``` http
GET /delivery-targets
Authorization: Bearer <jwt>
```

Returns delivery targets available to the authenticated user.

## Create a target

``` http
POST /delivery-targets
Authorization: Bearer <jwt>
Content-Type: application/json
```

A delivery target contains the destination configuration used by the
worker.

Use the generated API documentation at `/docs` for the exact request
model supported by the current build.

## Get a target

``` http
GET /delivery-targets/{target_id}
Authorization: Bearer <jwt>
```

Use this to inspect an individual target.

## Update a target

``` http
PATCH /delivery-targets/{target_id}
Authorization: Bearer <jwt>
Content-Type: application/json
```

Only the fields supported by the current request model should be sent.

## Delete a target

``` http
DELETE /delivery-targets/{target_id}
Authorization: Bearer <jwt>
```

Deleting a target removes it from the user's configured delivery
targets. Make sure any routes depending on it are updated appropriately.

## Test a target

``` http
POST /delivery-targets/{target_id}/test
Authorization: Bearer <jwt>
```

Use this endpoint to test whether a configured destination can receive a
HookTrace request.

## Delivery logs

Inspect logs for a target with:

``` http
GET /delivery-targets/{target_id}/logs
Authorization: Bearer <jwt>
```

Logs are intended to help diagnose destination responses, request
failures, and delivery behavior.

## Target statistics

``` http
GET /delivery-targets/{target_id}/stats
Authorization: Bearer <jwt>
```

This endpoint exposes statistics associated with an individual target.

There is also an aggregate target statistics endpoint:

``` http
GET /delivery-targets/stats
Authorization: Bearer <jwt>
```

## Relationship with routes

Targets and routes are separate resources.

A typical configuration is:

``` text
Route
  ├── Target A
  └── Target B
```

Routes receive events. Delivery targets provide destinations. The worker
uses the route-to-target relationship to perform downstream delivery.

See [Routes](./routes.md) for attaching targets to routes.
