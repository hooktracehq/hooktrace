import time
from redis_client import redis_client

LIMIT = 100  # requests
WINDOW = 60  # seconds


def check_rate_limit(token: str, route: str):
    current_window = int(time.time() // WINDOW)

    key = f"ratelimit:{token}:{route}:{current_window}"

    count = redis_client.incr(key)

    if count == 1:
        redis_client.expire(key, WINDOW)

    return count <= LIMIT