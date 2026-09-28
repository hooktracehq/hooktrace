# GitHub

GitHub can send webhook events to HookTrace, allowing you to inspect repository activity and deliver webhook events to your application.

```text
GitHub
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
* A GitHub repository or organization where you can configure webhooks
* A destination application that can receive the webhook

For local development, you can also use a HookTrace tunnel.

## 1. Create a HookTrace route

Create a route in HookTrace that will receive GitHub webhook requests.

The route provides the endpoint that GitHub will call.

Keep the route's webhook URL available for the GitHub configuration step.

See [Routes](../concepts/routes.md) for more information.

## 2. Configure the GitHub webhook

Open the repository where you want to configure the webhook.

Navigate to:

**Repository → Settings → Webhooks → Add webhook**

Use the HookTrace route URL as the webhook endpoint.

Conceptually:

```text
GitHub Repository
       │
       ▼
    Webhooks
       │
       ▼
HookTrace Route URL
```

## 3. Configure the payload format

GitHub webhooks can be configured with a payload content type.

Use the format expected by your HookTrace route and downstream application.

When your application depends on a specific GitHub webhook payload structure, verify the selected format against the GitHub webhook documentation.

## 4. Select events

GitHub allows you to choose which repository events should trigger webhook requests.

You can configure:

* All events
* Individual events

Choose only the events your application needs.

For example, a deployment workflow may require deployment-related events, while a repository automation tool may need push or pull-request events.

## 5. Configure the webhook secret

GitHub supports a webhook secret for validating webhook requests.

If you configure a secret in GitHub, keep the corresponding secret secure in your integration.

Do not commit webhook secrets to the repository.

If signature validation is enabled in your HookTrace deployment, follow the corresponding HookTrace configuration and GitHub's webhook-signature requirements.

## 6. Send a test webhook

After creating the webhook, use GitHub's webhook interface to test the endpoint.

GitHub provides delivery information for webhook requests.

The expected flow is:

```text
GitHub Test Delivery
        │
        ▼
HookTrace Route
        │
        ▼
HookTrace Event
```

Open HookTrace and verify that the event was received.

## 7. Inspect the event

Once GitHub sends the webhook, inspect the event in HookTrace.

Check:

* Event status
* Request headers
* Payload
* Route
* Timestamp
* Delivery information

This lets you verify the webhook before troubleshooting the destination application.

## 8. Configure the delivery target

Configure the HookTrace route with the application that should ultimately receive the GitHub webhook.

```text
GitHub
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

GitHub only needs to know about the HookTrace endpoint. The downstream destination can be managed through HookTrace.

## 9. Verify delivery

After HookTrace receives the GitHub event, verify that the event is delivered to your application.

Check:

1. The event appears in HookTrace.
2. A delivery was attempted.
3. Your application received the request.
4. The destination returned the expected response.

If delivery fails, inspect the delivery and retry information.

See [Deliveries](../concepts/deliveries.md) and [Retries](../concepts/retries.md).

## Webhook signatures

GitHub supports webhook signatures using the configured webhook secret.

If your application verifies GitHub webhook signatures, preserve the required request information when forwarding the webhook.

Signature verification should follow GitHub's current webhook documentation and the requirements of your application.

Do not assume that GitHub's signature format is interchangeable with another provider's webhook-signing mechanism.

## Organization webhooks

GitHub also supports webhooks at the organization level.

The same HookTrace model applies:

```text
GitHub Organization
        │
        ▼
     HookTrace
        │
        ▼
      Event
        │
        ▼
    Application
```

The exact webhook permissions and available events depend on the GitHub configuration and your access level.

## Local development

If your GitHub webhook handler runs locally, a HookTrace tunnel can expose the development workflow through HookTrace.

```text
GitHub
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

This allows you to test GitHub webhook events without deploying your application for every development change.

See [Tunnels](../concepts/tunnels.md).

## Debugging

If a GitHub webhook does not appear in HookTrace, check:

* The GitHub webhook URL
* The repository or organization webhook configuration
* Selected events
* GitHub's webhook delivery status
* Whether the HookTrace endpoint is reachable

If the event appears in HookTrace but delivery to your application fails, check:

* The configured target
* Destination availability
* Delivery response
* Timeout behavior
* Retry status

## Replay a GitHub event

If HookTrace has already received a GitHub event, you can replay the existing event after fixing your destination application.

```text
GitHub Event
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

Replay avoids requiring GitHub to generate the original webhook again.

See [Replay](../concepts/replay.md).

## Production checklist

Before using the integration in production:

* Confirm the HookTrace endpoint is reachable by GitHub.
* Confirm the correct repository or organization webhook is configured.
* Select only the required events.
* Configure webhook signature verification where required.
* Configure the correct HookTrace delivery target.
* Test a webhook delivery.
* Verify the destination receives the request.
* Review retry behavior.
* Test replay with an appropriate event.
* Keep webhook secrets out of source control.

## Next steps

* [Stripe](./stripe.md) — configure Stripe webhooks
* [Razorpay](./razorpay.md) — configure Razorpay webhooks
* [Custom Webhooks](./custom-webhooks.md) — connect other providers
* [Routes](../concepts/routes.md) — understand HookTrace routes
* [Events](../concepts/events.md) — understand HookTrace events
* [Replay](../concepts/replay.md) — resend an existing event
