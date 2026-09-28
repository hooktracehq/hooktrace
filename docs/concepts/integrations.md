# Integrations

HookTrace is designed to work with services that send webhooks.

The integration model is simple:

```text id="3kq7sx"
Webhook Provider
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
Your Application
```

HookTrace receives the webhook, records it as an event, and delivers it to your configured destination.

## Provider integrations

HookTrace can be used with webhook-producing services such as:

* Stripe
* GitHub
* Razorpay
* Custom webhook providers

Provider-specific configuration may differ, but the underlying HookTrace workflow remains the same.

## How integrations work

Most webhook integrations follow these steps:

### 1. Create a HookTrace route

Create a route that will receive webhook traffic.

```text id="x1f7pa"
Provider
   │
   ▼
HookTrace Route
```

### 2. Configure the provider

In the provider's webhook settings, configure its webhook URL to point to your HookTrace route.

```text id="e4m9ks"
Provider Webhook Settings
          │
          ▼
     HookTrace URL
```

### 3. Send a test webhook

Use the provider's test webhook functionality when available.

HookTrace receives the request and records it as an event.

```text id="m8c2vz"
Provider
   │
   │ test webhook
   ▼
HookTrace
   │
   ▼
Event
```

### 4. Configure the destination

Configure the route's delivery target so HookTrace knows where to forward the event.

```text id="j6r4qn"
Provider
   │
   ▼
HookTrace
   │
   ▼
Your Application
```

### 5. Inspect the event

Use the HookTrace dashboard to inspect the received event and its delivery status.

This makes it possible to verify the integration before relying on it in production.

## Stripe

Stripe can send webhook events to HookTrace.

A typical flow is:

```text id="p4x8md"
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
Your Application
```

When configuring Stripe, use the HookTrace route as the webhook endpoint.

The exact Stripe event types and webhook settings depend on the integration you are building.

## GitHub

GitHub can send webhook events to HookTrace.

A typical flow is:

```text id="z2w6hf"
GitHub
   │
   │ webhook
   ▼
HookTrace
   │
   ▼
Event
   │
   ▼
Your Application
```

GitHub webhook configuration allows you to select the events that should be delivered.

HookTrace can then provide visibility into those incoming requests and their subsequent delivery.

## Razorpay

Razorpay can send webhook events to HookTrace.

The workflow is the same:

```text id="c7n3qb"
Razorpay
   │
   │ webhook
   ▼
HookTrace
   │
   ▼
Event
   │
   ▼
Your Application
```

Configure the HookTrace route as the webhook endpoint in your Razorpay integration.

## Custom webhooks

HookTrace is not limited to predefined providers.

Any service capable of sending an HTTP webhook request can potentially be used with HookTrace.

```text id="u5s8jw"
Any Webhook Provider
        │
        ▼
    HookTrace
        │
        ▼
  Your Application
```

For a custom provider:

1. Create a HookTrace route.
2. Configure the provider's webhook URL.
3. Configure the HookTrace delivery target.
4. Send a test request.
5. Inspect the resulting event.
6. Verify the delivery to your application.

## Authentication and signatures

Webhook providers may use authentication or request signatures to verify webhook requests.

The authentication and verification requirements are provider-specific.

Do not assume that every provider uses the same signature format or authentication mechanism.

When integrating a provider, follow that provider's webhook documentation for the required request configuration.

## Debugging an integration

If an integration is not working, trace the request through the HookTrace lifecycle:

```text id="q8n2rm"
Provider
   │
   ▼
Did HookTrace receive it?
   │
   ├── No → Check provider configuration
   │
   ▼
Was an event created?
   │
   ▼
Was delivery attempted?
   │
   ├── No → Check route configuration
   │
   ▼
Did the destination respond?
   │
   ├── No → Check destination
   │
   ▼
Was delivery successful?
```

This helps isolate whether the problem is with the provider, HookTrace configuration, or destination application.

## Testing integrations

For development, test the complete webhook lifecycle before using the integration in production.

A useful test flow is:

```text id="n4v6tp"
Send Test Webhook
       │
       ▼
HookTrace Receives Event
       │
       ▼
Inspect Payload
       │
       ▼
Delivery Attempt
       │
       ▼
Verify Destination
       │
       ▼
Test Replay
```

Testing replay is particularly useful because it verifies that an existing event can be sent through the delivery workflow again.

## Provider-specific documentation

Provider-specific integration guides can be added as HookTrace integrations mature.

The integration documentation should cover:

* Provider webhook configuration
* Required webhook URL
* Authentication or signature requirements
* Recommended events
* Test webhook workflow
* Troubleshooting
* HookTrace route configuration

## Next steps

* [Routes](./routes.md) — create webhook entry points
* [Events](./events.md) — inspect incoming webhooks
* [Deliveries](./deliveries.md) — understand forwarding
* [Replay](./replay.md) — resend existing events
* [Self-hosting](../self-hosting/overview.md) — deploy HookTrace
