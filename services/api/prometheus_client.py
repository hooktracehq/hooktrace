import os
from typing import Any

import httpx

PROMETHEUS_URL = os.getenv(
    "PROMETHEUS_URL",
    "http://prometheus:9090",
)


class PrometheusError(Exception):
    pass


async def query(promql: str) -> Any:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{PROMETHEUS_URL}/api/v1/query",
            params={"query": promql},
        )

    response.raise_for_status()

    payload = response.json()

    if payload["status"] != "success":
        raise PrometheusError(payload)

    return payload["data"]["result"]


async def query_range(
    promql: str,
    start: int,
    end: int,
    step: str = "1m",
) -> Any:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{PROMETHEUS_URL}/api/v1/query_range",
            params={
                "query": promql,
                "start": start,
                "end": end,
                "step": step,
            },
        )

    response.raise_for_status()

    payload = response.json()

    if payload["status"] != "success":
        raise PrometheusError(payload)

    return payload["data"]["result"]