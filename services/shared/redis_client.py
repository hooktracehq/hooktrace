import os
import socket
import redis

REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://redis:6379"
)

redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=None,
    socket_keepalive=True,
    socket_keepalive_options={
        socket.TCP_KEEPIDLE: 60,
        socket.TCP_KEEPINTVL: 10,
        socket.TCP_KEEPCNT: 3,
    },
    retry_on_timeout=True,
)