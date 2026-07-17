import asyncio
import json

import redis

from services.shared.redis_client import redis_client

REDIS_URL = "redis://redis:6379"


# ---------------------------------------
# Global events subscriber
# ---------------------------------------

async def _subscriber_loop(manager):
    r = redis.Redis.from_url(
        REDIS_URL,
        decode_responses=True,
    )

    pubsub = r.pubsub()
    pubsub.subscribe("events:updates")

    print("[subscriber] Redis pubsub listening on events:updates")

    for message in pubsub.listen():

        if message["type"] != "message":
            continue

        data = json.loads(message["data"])

        await manager.broadcast_event(data)


def start_redis_subscriber(manager):
    """
    Runs the global events subscriber
    in its own event loop.
    """

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(
        _subscriber_loop(manager)
    )


# ---------------------------------------
# Tunnel subscriber
# ---------------------------------------




    """
    Runs the tunnel subscriber
    in its own event loop.
    """

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(
        _tunnel_loop(manager)
    )