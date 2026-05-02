import asyncio
import json
import redis

REDIS_URL = "redis://redis:6379"

async def _subscriber_loop(manager):
    r = redis.Redis.from_url(REDIS_URL, decode_responses=True)
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
    Runs Redis pubsub in its own event loop inside a thread
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(_subscriber_loop(manager))




def start_tunnel_subscriber(manager):
    pubsub = redis_client.pubsub()
    pubsub.psubscribe("tunnel:*")

    print("[tunnel] subscriber started")

    for message in pubsub.listen():
        if message["type"] != "pmessage":
            continue

        channel = message["channel"].decode()
        token = channel.split(":")[1]

        data = json.loads(message["data"])

        manager.send_to_token(token, data)