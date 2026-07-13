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

async def _tunnel_loop(manager):

    pubsub = redis_client.pubsub()
    pubsub.psubscribe("tunnel:*")

    print("[subscriber] Listening on tunnel:*")

    for message in pubsub.listen():

        if message["type"] != "pmessage":
            continue

        channel = message["channel"]

        if isinstance(channel, bytes):
            channel = channel.decode()

        token = channel.split(":")[1]

        data = json.loads(message["data"])

        await manager.send(
            token,
            data,
            "token",
        )


def start_tunnel_subscriber(manager):
    """
    Runs the tunnel subscriber
    in its own event loop.
    """

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(
        _tunnel_loop(manager)
    )