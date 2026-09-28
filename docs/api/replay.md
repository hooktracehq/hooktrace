# Replay API

Replay allows a previously received webhook event to be sent through
HookTrace's processing pipeline again.

The replay endpoint is:

``` http
POST /events/{event_id}/replay
```

## Authentication

Replay is an authenticated management operation.

Send:

``` http
Authorization: Bearer <jwt>
```

## Replay an event

Example:

``` bash
curl -X POST   http://localhost:3001/events/<event-id>/replay   -H "Authorization: Bearer <jwt>"
```

The current implementation changes the selected event back to a pending
state and places its identifier onto the Redis `webhook:ingress` queue.

That means replay uses the same worker-driven processing path as normal
event handling.

## Why replay is useful

Replay is useful when:

-   a delivery target was temporarily unavailable
-   a downstream service recovered
-   you changed target configuration
-   you want to reproduce a webhook delivery
-   you need to re-run processing without asking the original provider
    to send the webhook again

## Replay versus retry

Replay and retry serve different operational purposes.

**Retry** is part of normal failure handling for a delivery attempt.

**Replay** is an explicit operator action that puts an existing event
back into processing.

See [Retries](../concepts/retries.md) for the normal retry lifecycle.

## Safety considerations

Replay can cause a destination to receive an event again.

Before replaying an event in production:

1.  Confirm that the destination can safely handle duplicate deliveries.
2.  Check whether the downstream operation is idempotent.
3.  Review the event and previous delivery attempts.
4.  Confirm that replaying the event is intentional.

HookTrace's inbound idempotency protection does not mean that an
operator-triggered replay should be treated as a brand-new webhook from
the original sender.
