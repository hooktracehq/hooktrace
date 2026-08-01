import asyncio
import math
from datetime import datetime, timedelta

from sqlalchemy import text
from .database import SessionLocal

from fastapi import APIRouter, HTTPException

from .prometheus_client import (
    PrometheusError,
    query,
    query_range,
)

router = APIRouter(
    prefix="/metrics",
    tags=["Metrics"],
)


def get_value(result) -> float:
    """
    Extract a numeric value from a Prometheus instant query result.
    Returns 0.0 for empty, NaN or Inf values.
    """

    if not result:
        return 0.0

    try:
        value = float(result[0]["value"][1])

        if math.isnan(value) or math.isinf(value):
            return 0.0

        return value

    except (KeyError, IndexError, TypeError, ValueError):
        return 0.0


def parse_provider_metrics(result):
    """
    Convert a Prometheus vector result into a dictionary keyed by provider.
    """

    providers = {}

    for item in result:
        provider = item.get("metric", {}).get("provider", "unknown")

        try:
            value = float(item["value"][1])
        except (KeyError, IndexError, TypeError, ValueError):
            value = 0.0

        providers[provider] = value

    return providers


def parse_timeseries(result):
    """
    Convert Prometheus matrix results into frontend-friendly time series.
    """

    if not result:
        return []

    series = []

    for sample in result[0]["values"]:
        timestamp, value = sample

        try:
            value = float(value)

            if math.isnan(value) or math.isinf(value):
                value = 0.0

        except (TypeError, ValueError):
            value = 0.0

        series.append(
            {
                "timestamp": int(float(timestamp)),
                "time": datetime.fromtimestamp(
                    float(timestamp)
                ).strftime("%H:%M"),
                "value": value,
            }
        )

    return series







async def get_trend(
    promql: str,
    hours: int = 1,
    step: str = "30s",
):
    """
    Execute a Prometheus range query and return frontend-ready
    time series data.
    """

    end = datetime.utcnow()
    start = end - timedelta(hours=hours)

    result = await query_range(
        promql=promql,
        start=int(start.timestamp()),
        end=int(end.timestamp()),
        step=step,
    )

    return {
    "range": f"{hours}h",
    "step": step,
    "data": parse_timeseries(result),
}

@router.get("/dashboard")
async def dashboard_metrics():
    try:
        (
            received_result,
            delivered_result,
            failed_result,
            retried_result,
            latency_result,
            success_rate_result,
        ) = await asyncio.gather(
            query("sum(hooktrace_webhooks_received_total)"),
            query("sum(hooktrace_events_delivered_total)"),
            query("sum(hooktrace_events_failed_total)"),
            query("sum(hooktrace_events_retried_total)"),
            query(
                """
                increase(hooktrace_delivery_latency_seconds_sum[5m])
                /
                increase(hooktrace_delivery_latency_seconds_count[5m])
                """
            ),
            query(
                """
    100 *
sum(hooktrace_events_delivered_total)
/
clamp_min(
    sum(hooktrace_events_delivered_total)
    +
    (sum(hooktrace_events_failed_total) or vector(0)),
    1
)
                """
            ),
        )

        return {
            "overview": {
                "received": int(get_value(received_result)),
                "delivered": int(get_value(delivered_result)),
                "failed": int(get_value(failed_result)),
                "retried": int(get_value(retried_result)),
                "success_rate": round(get_value(success_rate_result), 2),
                "avg_latency": round(get_value(latency_result), 3),
            }
        }

    except PrometheusError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prometheus error: {e}",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {e}",
        )


@router.get("/dashboard/providers")
async def provider_metrics():
    try:
        (
            delivered_result,
            failed_result,
            retried_result,
        ) = await asyncio.gather(
            query(
                "sum by(provider)(hooktrace_events_delivered_total)"
            ),
            query(
                "sum by(provider)(hooktrace_events_failed_total)"
            ),
            query(
                "sum by(provider)(hooktrace_events_retried_total)"
            ),
        )

        delivered = parse_provider_metrics(delivered_result)
        failed = parse_provider_metrics(failed_result)
        retried = parse_provider_metrics(retried_result)

        providers = sorted(
            set(delivered.keys())
            | set(failed.keys())
            | set(retried.keys())
        )

        response = []

        for provider in providers:
            delivered_count = int(delivered.get(provider, 0))
            failed_count = int(failed.get(provider, 0))
            retried_count = int(retried.get(provider, 0))

            total = delivered_count + failed_count

            success_rate = (
                round((delivered_count / total) * 100, 2)
                if total > 0
                else 0.0
            )

            response.append(
                {
                    "provider": provider,
                    "delivered": delivered_count,
                    "failed": failed_count,
                    "retried": retried_count,
                    "success_rate": success_rate,
                }
            )

        return {
            "providers": response
        }

    except PrometheusError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prometheus error: {e}",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {e}",
        )


@router.get("/dashboard/delivery-trend")
async def delivery_trend():
    try:
        return await get_trend(
            """
            sum(
                rate(
                    hooktrace_events_delivered_total[5m]
                )
            )
            """
        )

    except PrometheusError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prometheus error: {e}",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {e}",
        )
@router.get("/dashboard/failure-trend")
async def failure_trend():
    try:
        return await get_trend(
            """
            sum(
                increase(
                    hooktrace_events_failed_total[5m]
                )
            )
            """
        )

    except PrometheusError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prometheus error: {e}",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {e}",
        )


@router.get("/dashboard/retry-trend")
async def retry_trend():
    try:
        return await get_trend(
            """
            sum(
                rate(
                    hooktrace_events_retried_total[5m]
                )
            )
            """
        )

    except PrometheusError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prometheus error: {e}",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {e}",
        )


@router.get("/dashboard/latency-trend")
async def latency_trend():
    try:
        return await get_trend(
            """
           histogram_quantile(
  0.95,
  sum by(le)(
    rate(hooktrace_delivery_latency_seconds_bucket[5m])
  )
)
            """
        )

    except PrometheusError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prometheus error: {e}",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {e}",
        )

@router.get("/dashboard/stats")
async def dashboard_stats():
    try:
        (
            success_rate_result,
            error_rate_result,
            throughput_result,
            p95_latency_result,
        ) = await asyncio.gather(
            query(
                """
                100 *
sum(hooktrace_events_delivered_total)
/
clamp_min(
    sum(hooktrace_events_delivered_total)
    +
    (sum(hooktrace_events_failed_total) or vector(0)),
    1
)
                """
            ),
            query(
                """
                100 *
                sum(hooktrace_events_failed_total)
                /
                clamp_min(
                    sum(hooktrace_events_delivered_total)
                    +
                    sum(hooktrace_events_failed_total),
                    1
                )
                """
            ),
            query(
                """
                sum(
                    rate(
                        hooktrace_events_delivered_total[5m]
                    )
                )
                """
            ),
            query(
                """
                histogram_quantile(
                    0.95,
                    sum by(le)(
                        rate(
                            hooktrace_delivery_latency_seconds_bucket[5m]
                        )
                    )
                )
                """
            ),
        )

        return {
            "success_rate": round(get_value(success_rate_result), 2),
            "error_rate": round(get_value(error_rate_result), 2),
            "throughput": round(get_value(throughput_result), 2),
            "p95_latency": round(get_value(p95_latency_result), 3),
        }

    except PrometheusError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prometheus error: {e}",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {e}",
        )

@router.get("/dashboard/recent")
def recent_activity():
    db = SessionLocal()

    try:
        rows = db.execute(
            text(
                """
                SELECT
                    e.id,
                    e.provider,
                    e.event_type,
                    e.status,
                    e.delivery_duration,
                    r.route,
                    e.created_at
                FROM webhook_events e
                JOIN webhook_routes r
                    ON r.id = e.route_id
                ORDER BY e.created_at DESC
                LIMIT 20
                """
            )
        ).mappings().all()

        return {
            "events": [
                {
                    "id": row["id"],
                    "provider": row["provider"],
                    "event_type": row["event_type"],
                    "status": row["status"],
                    "route": row["route"],
                    "latency": row["delivery_duration"] or 0,
                    "created_at": row["created_at"],
                }
                for row in rows
            ]
        }

    finally:
        db.close()