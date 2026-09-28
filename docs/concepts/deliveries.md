# Deliveries

A **delivery** is an attempt by HookTrace to forward a received event to its configured destination.

Events describe what HookTrace received. Deliveries describe what HookTrace did with that event afterward.

```text id="1m7t2c"
Webhook Provider
       │
       ▼
     Event
       │
       ▼
   Delivery
       │
       ▼
Destination Application
```

## Event vs. delivery

These two concepts are closely related but serve different purposes.

| Concept  | Represents                                        |
| -------- | ------------------------------------------------- |
| Event    | The webhook request received by HookTrace         |
| Delivery | An attempt to forward that event to a destination |

For example:

```text id="9t5m1k"
Provider
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
Your API
```

The event preserves the incoming webhook record, while the delivery tracks the forwarding operation.

## Delivery lifecycle

A typical delivery follows this workflow:

```text id="3v8x2q"
Event
  │
  ▼
Queued
  │
  ▼
Delivery Attempt
  │
  ├───────────────┐
  │               │
  ▼               ▼
Success         Failure
                  │
                  ▼
                Retry
```

A successful delivery completes the forwarding workflow.

A failed delivery can enter the retry workflow depending on the configured retry behavior.

## Delivery target

A delivery target is the destination that receives the webhook after HookTrace has accepted it.

The target can be configured through the route.

```text id="6n4q1z"
                    Route
                      │
                      ▼
                    Event
                      │
                      ▼
                  Delivery
                      │
                      ▼
                    Target
                      │
                      ▼
                Your Application
```

This separation means your webhook provider can continue sending requests to HookTrace while the destination configuration is managed independently.

## Delivery attempts

A delivery represents an attempt to send an event to its destination.

If the destination responds successfully, the delivery can complete successfully.

If the request fails, HookTrace can process the failure through its retry mechanism.

This makes delivery history useful when investigating webhook problems.

## Observing deliveries

HookTrace provides visibility into the delivery process so you can investigate what happened after an event was received.

When debugging a webhook, the important questions are:

```text id="f7p2wq"
Was the event received?
        │
        ▼
Was delivery attempted?
        │
        ▼
What response did the destination return?
        │
        ▼
Did delivery succeed?
        │
        └── No → Retry
```

This separates problems occurring at the provider, HookTrace, and destination layers.

## Failed deliveries

A delivery can fail because the destination is unavailable or because the request does not complete successfully.

When a delivery fails, HookTrace's retry mechanism can attempt delivery again.

```text id="k4m8zs"
Delivery Attempt
       │
       ▼
    Failure
       │
       ▼
     Retry
       │
       ▼
Delivery Attempt
```

See [Retries](./retries.md) for the retry workflow.

## Deliveries and replay

Retry and replay solve related but different problems.

**Retry** is part of the delivery failure workflow.

**Replay** is an explicit action used to send an existing event through the delivery workflow again.

```text id="p5c9rx"
                 Event
                   │
             ┌─────┴─────┐
             │           │
           Retry       Replay
             │           │
             └─────┬─────┘
                   ▼
                Delivery
```

See [Replay](./replay.md) for more information.

## Debugging delivery problems

When a webhook does not arrive at your application, inspect the workflow in order:

1. Confirm the event reached HookTrace.
2. Confirm a delivery was created or attempted.
3. Inspect the delivery result.
4. If the delivery failed, check the retry workflow.
5. If necessary, replay the event after fixing the destination.

This gives you a structured way to diagnose webhook failures without relying solely on provider-side logs.

## Next steps

* [Retries](./retries.md) — understand failed delivery handling
* [Replay](./replay.md) — resend an existing event
* [Events](./events.md) — understand incoming webhook events
* [Routes](./routes.md) — configure webhook entry points and destinations
