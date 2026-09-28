# Stripe

Stripe can send webhook events to HookTrace, allowing you to inspect incoming events and deliver them to your application through a HookTrace route.

```text id="p6w8ds"
Stripe
  │
  │ webhook
  ▼
HookTrace Route
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

## Before you start

You need:

* A running HookTrace installation
* A HookTrace route
* A Stripe account
* A destination application that can receive the webhook

For local development, you can also use a HookTrace tunnel.

## 1. Create a HookTrace route

Create a route in HookTrace that will receive Stripe webhook requests.

The route provides the endpoint that Stripe will call.

After creating the route, keep its webhook URL available for the Stripe configuration step.

See [Routes](../concepts/routes.md) for more information about HookTrace routes.

## 2. Configure Stripe

In your Stripe Dashboard, open the webhook configuration for the account or environment you want to connect.

Add a webhook endpoint and enter the HookTrace route URL as the destination.

```text id="2c4x9v"
Stripe Dashboard
       │
       ▼
Webhook Endpoint
       │
       ▼
HookTrace Route URL
```

Stripe can be configured to send selected event types to the endpoint.

Choose the events your application actually needs rather than forwarding unnecessary event traffic.

## 3. Select Stripe events

Stripe supports many webhook event types.

The appropriate events depend on your application.

For example, an application handling payments may need payment-related events, while a subscription application may need subscription-related events.

Configure the event types required by your application in Stripe's webhook settings.

## 4. Send a test webhook

After configuring the endpoint, use Stripe's webhook testing functionality to send a test event.

The request should reach the HookTrace route.

The resulting flow is:

```text id="q7j2mk"
Stripe Test Event
       │
       ▼
HookTrace Route
       │
       ▼
HookTrace Event
```

Open the HookTrace dashboard and verify that the event appears.

## 5. Inspect the event

Once HookTrace receives the Stripe webhook, inspect the event in the dashboard.

Check:

* Event status
* Request headers
* Request payload
* Route
* Timestamp
* Delivery information

The event allows you to verify what HookTrace actually received from Stripe.

## 6. Configure the delivery target

Configure the HookTrace route with the destination where the Stripe webhook should ultimately be delivered.

```text id="v5n9rx"
Stripe
  │
  ▼
HookTrace
  │
  ▼
Delivery Target
  │
  ▼
Your Application
```

This keeps the Stripe endpoint pointed at HookTrace while allowing the destination application to be managed independently.

## 7. Verify delivery

After the event is received, HookTrace attempts to deliver it to the configured target.

Verify that:

1. The event exists in HookTrace.
2. A delivery was attempted.
3. The destination received the request.
4. The destination returned the expected response.

If delivery fails, inspect the delivery information and retry workflow.

See [Deliveries](../concepts/deliveries.md) and [Retries](../concepts/retries.md).

## Webhook signatures

Stripe supports webhook signature verification.

If your application relies on Stripe's webhook signature, preserve the relevant request headers when delivering the event to your application.

Signature verification should be implemented according to Stripe's current webhook documentation and the requirements of your application.

Do not treat a generic webhook signature implementation as interchangeable with Stripe's signing mechanism.

## Local development

You can use a HookTrace tunnel when your Stripe webhook handler is running locally.

```text id="n3d7hc"
Stripe
  │
  ▼
HookTrace
  │
  ▼
Tunnel
  │
  ▼
localhost
```

This allows you to test Stripe webhooks against a local application without deploying the application for every development change.

See [Tunnels](../concepts/tunnels.md).

## Debugging

If a Stripe webhook does not appear in HookTrace, check:

* The Stripe webhook endpoint URL
* The HookTrace route configuration
* Whether the HookTrace API is reachable
* Stripe's webhook delivery status

If the event appears in HookTrace but does not reach your application, check:

* The configured delivery target
* Destination availability
* Delivery response
* Timeout behavior
* Retry status

## Replay a Stripe event

If a Stripe event was received by HookTrace but the destination application failed to process it, you can replay the existing event after fixing the destination.

```text id="h4s8pc"
Stripe Event
     │
     ▼
HookTrace Event
     │
     │ replay
     ▼
Delivery
     │
     ▼
Your Application
```

Replay does not require Stripe to send the original event again.

See [Replay](../concepts/replay.md).

## Production checklist

Before using the integration in production:

* Confirm the HookTrace endpoint is publicly reachable.
* Confirm the correct Stripe environment and endpoint are configured.
* Select only the required Stripe event types.
* Configure the correct HookTrace delivery target.
* Verify successful test delivery.
* Verify webhook signature handling where required.
* Review retry behavior.
* Test replay with a non-destructive event where appropriate.
* Keep credentials and secrets out of source control.

## Next steps

* [GitHub](./github.md) — configure GitHub webhooks
* [Razorpay](./razorpay.md) — configure Razorpay webhooks
* [Custom Webhooks](./custom-webhooks.md) — connect other providers
* [Routes](../concepts/routes.md) — understand HookTrace routes
* [Events](../concepts/events.md) — understand HookTrace events
* [Replay](../concepts/replay.md) — resend an existing event
