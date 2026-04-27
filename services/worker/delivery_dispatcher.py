import requests
import json
from redis_client import redis_client
from .delivery_targets_router import route_webhook_to_targets
from services.tunnels.tunnel_manager import forward_to_tunnels


async def dispatch_webhook(webhook_event):
    """
    Main webhook dispatcher
    Routes webhook to configured delivery targets
    """

    user_id = webhook_event.get('user_id')
    provider = webhook_event.get('provider')
    payload = webhook_event.get('payload')
    headers = webhook_event.get('headers', {})
    
    # Route to delivery targets
    result = route_webhook_to_targets(
        user_id=user_id,
        webhook_data=payload,
        provider=provider
    )

    #  Dev mode tunnels
    await forward_to_tunnels(
        user_id=user_id,
        provider=provider,
        payload=payload,
        headers=headers
    )


    
    print(f"Delivered to {result['successful']} targets, {result['failed']} failed")
    return result