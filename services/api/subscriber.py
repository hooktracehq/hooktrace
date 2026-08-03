import asyncio
import json

import redis

REDIS_URL = "redis://redis:6379"


async def _subscriber_loop(manager):
    r = redis.Redis.from_url(
        REDIS_URL,
        decode_responses=True,
    )

    pubsub = r.pubsub()

    pubsub.subscribe("events:updates")

    print(
        "[subscriber] listening on events:updates"
    )

    while True:

        try:
            message = pubsub.get_message(
                ignore_subscribe_messages=True,
                timeout=1,
            )

            if message is not None:

                print(
                    "[subscriber] received:",
                    message,
                )

                data = json.loads(
                    message["data"]
                )

                await manager.broadcast_event(
                    data
                )

            await asyncio.sleep(0.01)

        except Exception as e:
            print(
                "[subscriber] ERROR:",
                e,
            )
            await asyncio.sleep(1)


def start_redis_subscriber(manager):
    loop = asyncio.new_event_loop()

    asyncio.set_event_loop(loop)

    loop.run_until_complete(
        _subscriber_loop(manager)
    )