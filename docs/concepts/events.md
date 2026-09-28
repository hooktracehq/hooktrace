# Events

An **event** is the record HookTrace creates when it receives a webhook request.

Events are the central object in the HookTrace workflow. They allow you to inspect what was received, track what happened during delivery, and replay an existing webhook when necessary.

```text
Webhook Provider
       │
       │ HTTP request
       ▼
   HookTrace Route
       │
       ▼
      Event
       │
       ├── Inspect
       │
       ├── Deliver
       │
       ├── Retry
       │
       └── Replay
```

## Event lifecycle

A typical event moves through the following workflow:

```text
Received
   │
   ▼
Recorded
   │
   ▼
Queued
   │
   ▼
Delivered
   │
   ├── Success
   │
   └── Failure
          │
          ▼
        Retry
```

An event can also be replayed after it has been recorded.

## What an event represents

An event represents the incoming webhook request rather than the subsequent delivery attempt.

This distinction is important:

* **Event** — what HookTrace received
* **Delivery** — what HookTrace attempted to send to a destination

For example:

```text
Stripe
  │
  │ webhook
  ▼
HookTrace
  │
  ▼
Event
  │
  ▼
Delivery
  │
  ▼
Your application
```

The original event remains the record of what HookTrace received, while delivery records describe what happened when HookTrace forwarded it.

## Event data

An event contains information associated with the incoming webhook request and its processing lifecycle.

Depending on the request and configuration, this includes information such as:

* Event identifier
* Route
* HTTP request information
* Request headers
* Request payload
* Processing status
* Timestamps
* Delivery information

The event identifier provides a stable reference that can be used when working with the event through the API.

## Inspecting events

Events can be inspected through the HookTrace dashboard.

The dashboard allows you to investigate incoming webhook traffic without relying exclusively on logs from the provider or your destination application.

This is useful when debugging:

* Unexpected webhook payloads
* Missing webhook deliveries
* Failed requests
* Incorrect headers
* Application errors
* Provider integration problems

## Event status

An event's status represents its current position in the HookTrace processing workflow.

The status can change as HookTrace processes the event and attempts delivery.

When a delivery fails, the event can enter a retry workflow rather than requiring the provider to send the webhook again.

## Events and deliveries

An event and a delivery are related but represent different parts of the system.

```text
                 Event
                   │
          ┌────────┴────────┐
          │                 │
      Request data      Processing
                              │
                              ▼
                          Delivery
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                 Success              Failure
                                        │
                                        ▼
                                      Retry
```

Think of an event as the **source record** and a delivery as an **attempt to forward that record**.

## Replaying an event

Once an event exists, HookTrace can replay it.

Replay allows the existing event to be placed back into the delivery workflow without requiring the original webhook provider to send the request again.

This is useful when:

* Your application was temporarily unavailable
* You fixed a bug in your webhook handler
* A previous delivery failed
* You need to reproduce a webhook during debugging

See [Replay](./replay.md) for more information.

## Events and routes

Every incoming webhook reaches HookTrace through a route.

The route provides the entry point, while the event represents the request received through that entry point.

```text
Route
  │
  ├── Event
  ├── Event
  ├── Event
  └── Event
```

A route can therefore receive many events over its lifetime.

## Events and debugging

One of the main purposes of storing events is observability.

Instead of investigating a webhook failure only from application logs, you can inspect the webhook at the infrastructure layer:

```text
Provider
   │
   ▼
HookTrace
   │
   ├── Request received?
   ├── Payload correct?
   ├── Headers present?
   ├── Event recorded?
   ├── Delivery attempted?
   └── Delivery successful?
```

This makes HookTrace useful as a debugging layer between webhook providers and your application.

## Events and replay

Replay works from the existing event record.

The original event can therefore be used to reproduce a delivery without depending on the provider's retry mechanism.

```text
Existing Event
      │
      │ replay
      ▼
Delivery Queue
      │
      ▼
Destination
```

For the API operation used to replay an event, see the [Replay API documentation](../api/replay.md).

## Next steps

* [Deliveries](./deliveries.md) — understand how HookTrace forwards events
* [Retries](./retries.md) — understand failed delivery handling
* [Replay](./replay.md) — resend an existing event
* [Routes](./routes.md) — understand where events enter HookTrace
