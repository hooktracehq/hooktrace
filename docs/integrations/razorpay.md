# Razorpay

Razorpay can send webhook events to HookTrace, allowing you to inspect incoming payment and account events and deliver them to your application through a HookTrace route.

```text
Razorpay
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
* A Razorpay account
* A destination application that can receive the webhook

For local development, you can also use a HookTrace tunnel.

## 1. Create a HookTrace route

Create a route in HookTrace that will receive Razorpay webhook requests.

The route provides the endpoint that Razorpay will call.

Keep the route's webhook URL available for the Razorpay configuration step.

See [Routes](../concepts/routes.md) for more information.

## 2. Configure Razorpay

Open the webhook configuration in your Razorpay Dashboard.

Add a webhook endpoint and configure the HookTrace route URL as the destination.

Conceptually:

```text id="d5q8pc"
Razorpay Dashboard
       │
       ▼
Webhook Configuration
       │
       ▼
HookTrace Route URL
```

The exact settings available depend on the Razorpay account and integration you are configuring.

## 3. Select webhook events

Razorpay provides different webhook events for different parts of its platform.

Select the events your application actually needs.

For example, a payment workflow may require payment-related events, while another application may need events related to orders, subscriptions, or other Razorpay resources.

Avoid subscribing to unnecessary events when they are not required by your application.

## 4. Configure the webhook secret

Razorpay webhook configuration can use a secret for verifying webhook requests.

Keep the webhook secret private.

Do not commit it to your repository or expose it in frontend code.

If your HookTrace deployment uses webhook signature validation, configure it according to the capabilities and configuration of your HookTrace installation.

## 5. Send a test webhook

After configuring the endpoint, use Razorpay's available webhook testing functionality to send a test request.

The expected flow is:

```text id="w7m3nz"
Razorpay Test Webhook
        │
        ▼
HookTrace Route
        │
        ▼
HookTrace Event
```

Open the HookTrace dashboard and confirm that the event was received.

## 6. Inspect the event

Inspect the resulting event in HookTrace.

Check:

* Event status
* Request headers
* Request payload
* Route
* Timestamp
* Delivery information

This confirms that HookTrace is receiving the Razorpay webhook correctly.

## 7. Configure the delivery target

Configure the HookTrace route with the destination application that should receive the Razorpay event.

```text id="q4s7hx"
Razorpay
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

Razorpay sends the webhook to HookTrace, while HookTrace handles forwarding it to your configured destination.

## 8. Verify delivery

After the event is received, verify that HookTrace delivers it to your application.

Check:

1. The event appears in HookTrace.
2. A delivery was attempted.
3. Your application received the request.
4. The destination returned the expected response.

If the delivery fails, inspect the delivery result and retry status.

See [Deliveries](../concepts/deliveries.md) and [Retries](../concepts/retries.md).

## Webhook signatures

Razorpay webhook requests can be verified using the configured webhook secret and the signing mechanism provided by Razorpay.

If your application validates Razorpay webhook signatures, follow Razorpay's current webhook documentation for the exact verification process.

Do not assume that Razorpay's signature format is interchangeable with Stripe, GitHub, or another webhook provider.

## Local development

If your Razorpay webhook handler runs locally, use a HookTrace tunnel to forward webhook traffic to your development machine.

```text id="v6n2rw"
Razorpay
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

See [Tunnels](../concepts/tunnels.md).

## Debugging

If a Razorpay webhook does not appear in HookTrace, check:

* The Razorpay webhook endpoint URL
* Razorpay webhook configuration
* Selected webhook events
* Whether the HookTrace endpoint is reachable
* Razorpay's webhook delivery information

If the event appears in HookTrace but does not reach your application, check:

* The configured delivery target
* Destination availability
* Delivery response
* Timeout behavior
* Retry status

## Replay a Razorpay event

If HookTrace has already received a Razorpay event, you can replay the existing event after fixing the destination application.

```text id="k9r3fx"
Razorpay Event
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

Replay allows you to resend the existing event without requiring Razorpay to generate the original webhook again.

See [Replay](../concepts/replay.md).

## Production checklist

Before using the integration in production:

* Confirm the HookTrace endpoint is reachable.
* Confirm the correct Razorpay webhook configuration is active.
* Select only the required events.
* Configure webhook verification where required.
* Configure the correct HookTrace delivery target.
* Test webhook delivery.
* Verify the destination receives the request.
* Review retry behavior.
* Test replay with an appropriate event.
* Keep webhook secrets out of source control.

## Next steps

* [Stripe](./stripe.md) — configure Stripe webhooks
* [GitHub](./github.md) — configure GitHub webhooks
* [Custom Webhooks](./custom-webhooks.md) — connect other providers
* [Routes](../concepts/routes.md) — understand HookTrace routes
* [Events](../concepts/events.md) — understand HookTrace events
* [Replay](../concepts/replay.md) — resend an existing event
