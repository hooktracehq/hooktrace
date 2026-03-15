import math
from datetime import datetime, timedelta

MAX_DELAY = 3600  # 1 hour


def next_retry_delay(retry_count: int) -> int:
    delay = min(MAX_DELAY, (2 ** retry_count) * 10)
    return delay


def next_retry_time(retry_count: int):
    delay = next_retry_delay(retry_count)
    return datetime.utcnow() + timedelta(seconds=delay)