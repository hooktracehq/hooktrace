import json
import traceback
import os
import redis.asyncio as redis

REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://redis:6379"
)

async def _get_redis_client(config):
    redis_url = (
        config.get("redisUrl")
        or config.get("redis_url")
        or REDIS_URL
    )

    return redis.from_url(
        redis_url,
        decode_responses=True,
    )


async def deliver_redis(config, payload):
    try:
        channel = config.get("channel") or config.get("queue")

        if not channel:
            raise ValueError("Missing Redis channel")

        client = await _get_redis_client(config)

        await client.lpush(
            channel,
            json.dumps(payload),
        )

        return {
            "status_code": 200,
            "body": "redis publish",
            "duration_ms": 0,
        }

    except Exception:
        traceback.print_exc()
        raise