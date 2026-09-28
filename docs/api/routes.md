# Routes API

Routes are the core configuration object that connects an incoming
webhook endpoint to one or more delivery destinations.

The management API is exposed under:

``` text
/routes
```

Webhook ingestion is exposed separately through the relay endpoints.

## Route management

The route-management API currently exposes:

``` text
GET    /routes
POST   /routes
PATCH  /routes/{route_id}/aggregation
GET    /routes/{route_id}/targets
POST   /routes/{route_id}/targets/{target_id}
DELETE /routes/{route_id}/targets/{target_id}
```

Management endpoints require an authenticated user.

## List routes

``` http
GET /routes
Authorization: Bearer <jwt>
```

Use this endpoint to retrieve routes available to the authenticated
user.

## Create a route

``` http
POST /routes
Authorization: Bearer <jwt>
Content-Type: application/json
```

A route represents an inbound webhook path and its delivery
configuration.

The current route model supports concepts including:

-   `route`
-   `mode`
-   development target
-   production target
-   route token
-   route secret
-   provider configuration

`mode` is used by HookTrace to distinguish development and production
behavior.

For the exact request schema supported by the running version, use the
generated FastAPI schema at `/docs`.

## Route targets

A route can expose its configured delivery targets:

``` http
GET /routes/{route_id}/targets
Authorization: Bearer <jwt>
```

A target can be attached to a route:

``` http
POST /routes/{route_id}/targets/{target_id}
Authorization: Bearer <jwt>
```

And detached:

``` http
DELETE /routes/{route_id}/targets/{target_id}
Authorization: Bearer <jwt>
```

The target itself is managed through the Delivery Targets API.

## Aggregation configuration

Route-level event aggregation can be updated with:

``` http
PATCH /routes/{route_id}/aggregation
Authorization: Bearer <jwt>
Content-Type: application/json
```

Use the generated API schema to see the currently supported aggregation
fields.

## Receiving a webhook

Once a route exists, a sender can post to the relay endpoint:

``` http
POST /r/{token}/{route}
```

Example:

``` bash
curl -X POST http://localhost:3001/r/<token>/orders   -H "Content-Type: application/json"   -d '{"type":"order.created","id":"ord_123"}'
```

The endpoint accepts the request, persists it as an event, and places it
onto the webhook processing queue.

A successful request returns an accepted response containing information
such as:

``` json
{
  "accepted": true,
  "event_id": "<event-id>",
  "provider": "generic",
  "event_type": "order.created"
}
```

## Integration webhook endpoint

HookTrace also exposes:

``` http
POST /webhook/{token}
```

This endpoint resolves the route associated with the token and passes
the request through the same relay processing flow.

## Provider detection

HookTrace can detect supported providers from webhook headers. The
current implementation recognizes provider-specific signatures for
providers including:

-   Stripe
-   GitHub
-   Razorpay
-   Shopify
-   Slack
-   Discord
-   Notion
-   Supabase

If provider-specific headers are not present, HookTrace can fall back to
the provider configured on the route or treat the request as generic.

## Idempotency

Send an `Idempotency-Key` header when the sender may retry the same
logical request:

``` http
Idempotency-Key: request-123
```

HookTrace uses the key together with the route to detect duplicate
webhook events.

A duplicate can be acknowledged without creating another event:

``` json
{
  "accepted": true,
  "deduplicated": true
}
```

## Signature validation

For production-mode routes with a configured secret, HookTrace can
validate provider signatures.

Generic webhook signatures use the route secret and signature metadata.
Provider-specific integrations use their provider verification
implementation when available.

A failed signature check returns an HTTP `401` response.

## Rate limiting

Incoming relay requests are rate-limited. When the configured limit is
exceeded, HookTrace returns:

``` http
429 Too Many Requests
```

with a response similar to:

``` json
{
  "detail": "Rate limit exceeded"
}
```
