# Retries

Webhook destinations are not always available.

A destination can temporarily fail because of an outage, network problem, timeout, or application error. HookTrace can retry failed deliveries so temporary failures do not immediately become permanent failures.

```text id="7r2m5k"
Event
  │
  ▼
Delivery
  │
  ▼
Destination
  │
  ├── Success ──► Complete
  │
  └── Failure
        │
        ▼
      Retry
        │
        ▼
   Delivery Attempt
```

## Why retries matter

Without retries, a temporary destination failure could cause a webhook to be lost from the destination application's perspective.

Retries give the destination another opportunity to successfully process the webhook.

Typical temporary failures include:

* Destination service outage
* Network failure
* Connection failure
* Request timeout
* Temporary server error

## Retry lifecycle

When a delivery fails, HookTrace can place the delivery back into the processing workflow.

```text id="f9k3p1"
Delivery Attempt
       │
       ▼
    Failure
       │
       ▼
  Retry Scheduled
       │
       ▼
Delivery Attempt
       │
    ┌──┴──┐
    ▼     ▼
 Success Failure
          │
          ▼
        Retry
```

The process continues according to the configured retry behavior.

## Retry attempts

HookTrace exposes configuration for controlling retry behavior.

Relevant configuration includes:

| Configuration                     | Description                             |
| --------------------------------- | --------------------------------------- |
| `WEBHOOK_MAX_RETRY_ATTEMPTS`      | Maximum webhook retry attempts          |
| `WORKER_MAX_RETRIES`              | Maximum worker retry attempts           |
| `WORKER_RETRY_BACKOFF_MULTIPLIER` | Multiplier used by worker retry backoff |
| `WORKER_RETRY_BACKOFF_DELAY_MS`   | Base retry backoff delay                |

These values can be configured through the HookTrace environment.

## Backoff

Retries should not normally happen continuously without a delay.

HookTrace's worker configuration includes a retry delay and backoff multiplier so repeated attempts can be separated over time.

Conceptually:

```text id="2x7q4m"
Attempt 1
   │
   ▼
Wait
   │
   ▼
Attempt 2
   │
   ▼
Longer wait
   │
   ▼
Attempt 3
```

This gives temporarily unavailable destinations time to recover while avoiding an immediate sequence of repeated requests.

## Retry vs. replay

Retries and replay are different operations.

### Retry

A **retry** is part of the automatic failure-handling workflow.

```text id="a4k8zs"
Delivery
   │
   ▼
Failure
   │
   ▼
Retry
```

### Replay

A **replay** is an explicit request to send an existing event through the delivery workflow again.

```text id="c6n2px"
Existing Event
      │
      ▼
    Replay
      │
      ▼
  Delivery
```

Use retries for temporary delivery failures.

Use replay when you intentionally want to resend an existing event, such as after fixing your receiving application.

## When retries stop

Retries are bounded by the configured retry limits.

Once the configured retry attempts have been exhausted, HookTrace does not continue retrying indefinitely.

At that point, the delivery should be investigated and, when appropriate, the event can be replayed after the underlying problem has been fixed.

## Debugging failed retries

When a delivery continues to fail, investigate the destination rather than repeatedly replaying the event.

Check:

1. Is the destination application running?
2. Is the configured target URL correct?
3. Is the destination reachable?
4. Is the application returning an error response?
5. Is the request timing out?
6. Has the retry limit been reached?

After correcting the destination problem, an existing event can be replayed when necessary.

## Retry configuration

For self-hosted installations, retry-related settings are configured through environment variables.

Example:

```env
WEBHOOK_MAX_RETRY_ATTEMPTS=5

WORKER_MAX_RETRIES=5
WORKER_RETRY_BACKOFF_MULTIPLIER=2
WORKER_RETRY_BACKOFF_DELAY_MS=1000
```

The exact values should be chosen according to the reliability requirements of your webhook destinations.

## Next steps

* [Deliveries](./deliveries.md) — understand delivery attempts
* [Replay](./replay.md) — intentionally resend existing events
* [Events](./events.md) — understand the event lifecycle
* [Self-hosting](../self-hosting/overview.md) — configure HookTrace
