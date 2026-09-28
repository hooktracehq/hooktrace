# Routes

A **route** is the entry point for webhook traffic in HookTrace.

Routes connect an incoming webhook path to the destination where HookTrace should deliver the event.

```text
Webhook Provider
       │
       ▼
   HookTrace Route
       │
       ▼
     Event
       │
       ▼
   Delivery Target
```

## What a route does

A route provides a stable webhook endpoint that your provider can send requests to.

Once a request reaches the route, HookTrace can:

1. Receive the webhook
2. Record it as an event
3. Queue it for delivery
4. Deliver it to the configured target
5. Track the delivery result
6. Retry failed deliveries when applicable
7. Allow the event to be replayed later

## Development and production targets

HookTrace routes support separate development and production targets.

A route can therefore represent the same webhook integration while pointing to different destinations depending on the selected mode.

```text
                    Route
                      │
              ┌───────┴───────┐
              │               │
           Dev mode        Prod mode
              │               │
              ▼               ▼
       Development       Production
          target            target
```

The route configuration includes a mode and can contain development and production target information.

## Route configuration

Routes can contain:

| Field         | Description                            |
| ------------- | -------------------------------------- |
| `route`       | The route identifier/path              |
| `mode`        | Delivery mode, such as `dev` or `prod` |
| `dev_target`  | Target used for development delivery   |
| `prod_target` | Target used for production delivery    |
| `token`       | Route token when configured            |
| `secret`      | Route secret when configured           |

The exact values depend on how the route is configured.

## Creating a route

Routes can be created through the HookTrace API.

The API accepts the route configuration and creates a route that can subsequently be used for receiving webhook events.

For API details, see the [API documentation](../api/introduction.md).

## Listing routes

Existing routes can be retrieved through the API.

This allows clients such as the HookTrace dashboard to display configured webhook routes and their current configuration.

## Updating a route

A route's configuration can be updated after it has been created.

This is useful when you need to change the destination or switch the configuration used by a route without creating an entirely new route.

## Deleting a route

Routes can also be deleted when they are no longer required.

Deleting a route removes that route from the configured HookTrace routes.

## Route lifecycle

A typical route lifecycle looks like this:

```text
Create Route
     │
     ▼
Configure Target
     │
     ▼
Receive Webhooks
     │
     ▼
Create Events
     │
     ▼
Deliver Events
     │
     ├── Success
     │
     └── Failure → Retry
                         │
                         ▼
                       Replay
```

## Routes and events

A route is the connection between the incoming webhook request and the event created by HookTrace.

Multiple webhook events can pass through the same route over time.

```text
                 Route
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
     Event 1    Event 2    Event 3
        │          │          │
        ▼          ▼          ▼
    Delivery    Delivery    Delivery
```

This makes the route the natural place to organize webhook traffic for a particular integration or application.

## Routes and targets

A route determines where HookTrace receives traffic; its configured target determines where HookTrace sends that traffic afterward.

This separation is useful because your external webhook provider only needs to know the HookTrace endpoint, while your destination can change independently.

```text
Provider
   │
   │ webhook
   ▼
HookTrace Route
   │
   │ event
   ▼
HookTrace
   │
   │ delivery
   ▼
Target Application
```

## Next steps

* [Events](./events.md) — understand how incoming webhooks become events
* [Deliveries](./deliveries.md) — understand how events are delivered
* [Retries](./retries.md) — understand failed deliveries
* [Replay](./replay.md) — resend an existing event
* [API](../api/introduction.md) — work with routes programmatically
