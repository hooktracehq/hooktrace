# Events API

An event is a webhook request accepted by HookTrace and persisted for
processing.

The inbound lifecycle is broadly:

``` text
Webhook request
      ↓
Route lookup
      ↓
Provider detection
      ↓
Signature validation
      ↓
Idempotency check
      ↓
Event persistence
      ↓
Redis ingress queue
      ↓
Worker delivery
```

## Event creation

Webhook events are created through the relay endpoints rather than a
separate event-creation API.

Use:

``` http
POST /r/{token}/{route}
```

or:

``` http
POST /webhook/{token}
```

When accepted, HookTrace stores request metadata and payload information
and returns an `event_id`.

## Event metadata

The event model currently records information including:

-   route
-   request headers
-   payload
-   status
-   idempotency key
-   provider
-   event type

Provider event types are extracted when the configured provider
implementation supports extraction. For generic payloads, HookTrace also
checks common fields such as `type`, `event_type`, and `event`.

## Event status

Newly accepted events enter processing with a pending state.

The worker then processes the event and creates delivery attempts
against configured targets.

For operational details around delivery state and retries, see:

-   [Deliveries](./deliveries.md)
-   [Retries](../concepts/retries.md)

## Idempotency

If the sender provides an `Idempotency-Key`, HookTrace checks for an
existing event for the same route and key.

This prevents accidental duplicate processing when an upstream provider
retries the same request.

## Provider handling

HookTrace preserves incoming request headers and payload data so that
provider-aware processing and delivery diagnostics have access to the
original webhook context.

JSON payloads are parsed into structured data when the request content
type indicates JSON. Non-JSON bodies are retained as text when possible.

## Queueing

After an event is persisted, HookTrace places the event identifier onto
the Redis `webhook:ingress` queue.

This separates accepting the webhook from performing downstream delivery
work.

That separation is important for webhook senders: the inbound API can
acknowledge an accepted event without waiting for every downstream
destination to finish.

## Event replay

Previously received events can be replayed through the replay endpoint:

``` http
POST /events/{event_id}/replay
```

See [Replay](./replay.md).
