
import asyncio
import time
import json

from threading import Thread
from sqlalchemy import text

from .database import SessionLocal
from services.shared.redis_client import redis_client
from .retry_policy import next_retry_time

from prometheus_client import start_http_server

from .metrics import (
    events_delivered,
    events_failed,
    events_retried,
    delivery_latency,
)

from .delivery_targets_router import route_webhook_to_targets


QUEUE_MAIN = "webhook:ingress"
QUEUE_RETRY = "webhook:retry"
QUEUE_DLQ = "webhook:dlq"

REPLAY_QUEUE = "replay:jobs"

MAX_RETRIES = 5


# =========================
# BATCH HELPERS
# =========================




# =========================
# REALTIME UPDATES
# =========================
# def publish_update(
#     event_id,
#     status,
#     attempt=0,
#     user_id=None,
#     provider=None,
#     route=None,
#     token=None,
#     created_at=None,
# ):
#     try:
#         payload = {
#             "id": event_id,
#             "status": status,
#             "attempt_count": attempt or 0,
#             "user_id": str(user_id) if user_id else None,
#             "provider": provider,
#             "route": route,
#             "token": token,
#             "created_at": created_at.isoformat() if created_at else None,
#         }

#         subscribers = redis_client.publish(
#             "events:updates",
#             json.dumps(payload),
#         )

#         print(
#             f"[publish_update] Event {event_id} -> {status} "
#             f"(subscribers={subscribers})"
#         )

#     except Exception as e:
#         print(f"[publish_update] ERROR: {e}")


def publish_update(
    event_id,
    status,
    attempt=0,
    user_id=None,
    provider=None,
    route=None,
    token=None,
    created_at=None,

    # NEW
    event_type=None,
    latency_ms=None,
    payload_size=None,
    last_error=None,
):
    try:
        payload = {
            "id": event_id,
            "status": status,
            "attempt_count": attempt or 0,

            "user_id": str(user_id) if user_id else None,
            "provider": provider,
            "route": route,
            "token": token,

            "created_at": (
                created_at.isoformat()
                if created_at
                else None
            ),

            # New fields
            "event_type": event_type,
            "latency_ms": latency_ms,
            "payload_size": payload_size,
            "last_error": last_error,
        }

        subscribers = redis_client.publish(
            "events:updates",
            json.dumps(payload),
        )

        print(
            f"[publish_update] "
            f"Event {event_id} -> {status} "
            f"(subscribers={subscribers})"
        )

    except Exception as e:
        print(f"[publish_update] ERROR: {e}")
# =========================
# BATCH PROCESSING
# =========================


def finalize_replay_job_for_event(
    db,
    event_id: int,
):
    """
    Finalize any replay jobs associated with this event
    once all events in the job have reached a terminal state.
    """

    jobs = db.execute(
        text(
            """
            SELECT DISTINCT replay_job_id
            FROM replay_job_events
            WHERE event_id = :event_id
            """
        ),
        {
            "event_id": event_id,
        },
    ).fetchall()

    for job in jobs:
        job_id = job[0]

        unfinished = db.execute(
            text(
                """
                SELECT COUNT(*)
                FROM replay_job_events
                WHERE
                    replay_job_id = :job_id
                    AND status NOT IN (
                        'completed',
                        'failed'
                    )
                """
            ),
            {
                "job_id": job_id,
            },
        ).scalar()

        if unfinished == 0:

            db.execute(
                text(
                    """
                    UPDATE replay_jobs
                    SET finished_at = COALESCE(
                        finished_at,
                        NOW()
                    )
                    WHERE
                        id = :job_id
                        AND finished_at IS NULL
                    """
                ),
                {
                    "job_id": job_id,
                },
            )

            print(
                f"[Replay] Job {job_id} finished"
            )
# =========================
# EVENT DELIVERY
# =========================
def deliver_event(event_id: int):
    print("worker started")

    start = time.perf_counter()
    row = None

    db = SessionLocal()

    try:
        # =========================
        # CLAIM EVENT
        # =========================
        print(f"Trying to claim event {event_id}")

        claimed = db.execute(
            text("""
                UPDATE webhook_events
                SET
                    status = 'processing',
                    attempt_count = COALESCE(attempt_count, 0) + 1
                WHERE id = :id
                AND status IN ('pending', 'queued', 'retrying')
            """),
            {"id": event_id},
        )

        print("claimed rows:", claimed.rowcount)

        if claimed.rowcount == 0:
            db.rollback()
            return

        db.commit()

        # =========================
        # LOAD EVENT
        # =========================
        row = db.execute(
            text("""
                SELECT
                    e.*,
                    r.id AS route_id,
                    r.token,
                    r.route,
                    r.mode,
                    r.dev_target,
                    r.prod_target,
                    r.user_id,
                    r.tunnel_id
                FROM webhook_events e
                JOIN webhook_routes r
                    ON r.id = e.route_id
                WHERE e.id = :id
            """),
            {"id": event_id},
        ).mappings().first()

        print("loaded row:", row)

        if not row:
            print(f"[worker] Event {event_id} not found")
            return

        user_id = row["user_id"]

        # IMPORTANT:
        # attempt_count was already incremented when claiming.
        current_attempt = row.get("attempt_count") or 1

        # =========================
        # PAYLOAD
        # =========================
        payload = row["payload"]

        if isinstance(payload, str):
            try:
                payload = json.loads(payload)
            except Exception:
                payload = {}

        if payload is None:
            payload = {}

        payload_size = 0

        try:
            payload_size = len(
                json.dumps(payload).encode("utf-8")
            )
        except Exception:
            pass

        # =========================
        # HEADERS
        # =========================
        headers = row["headers"]

        if isinstance(headers, str):
            try:
                headers = json.loads(headers)
            except Exception:
                headers = {}

        if headers is None:
            headers = {}

        # =========================
        # REALTIME: PROCESSING
        # =========================
        print("About to call publish_update()")

        publish_update(
            event_id=event_id,
            status="processing",
            attempt=current_attempt,
            user_id=row["user_id"],
            provider=row["provider"],
            route=row["route"],
            token=row["token"],
            created_at=row["created_at"],
            event_type=row["event_type"],
            payload_size=payload_size,
        )

        print("2. publish_update done")

        # =========================
        # AGGREGATION
        # =========================
        try:
            print("3. loading aggregation rules")

            rules = db.execute(
                text("""
                    SELECT
                        id,
                        event_patterns,
                        provider
                    FROM aggregation_rules
                    WHERE user_id = :user_id
                    AND enabled = TRUE
                """),
                {"user_id": user_id},
            ).mappings().all()

            print(
                "4. aggregation rules loaded",
                len(rules),
            )

            db.commit()

        except Exception as e:
            print(
                f"[worker] aggregation error: {e}"
            )

        print("5. before mode check")

        # =========================
        # DEV MODE
        # =========================
        if row["mode"] == "dev":

            try:
                redis_client.publish(
                    f"tunnel:{row['token']}",
                    json.dumps(
                        {
                            "headers": headers,
                            "payload": payload,
                            "route": row["route"],
                            "event_id": event_id,
                            "provider": row["provider"],
                            "event_type": row["event_type"],
                            "created_at": (
                                row["created_at"].isoformat()
                                if row["created_at"]
                                else None
                            ),
                        }
                    ),
                )

                elapsed_ms = round(
                    (time.perf_counter() - start) * 1000,
                    2,
                )

                # Mark event delivered
                db.execute(
                    text("""
                        UPDATE webhook_events
                        SET
                            status = 'delivered',
                            attempt_count = :attempts,
                            delivery_duration = :duration,
                            last_error = NULL,
                            next_retry_at = NULL,
                            processed_at = NOW()
                        WHERE id = :id
                    """),
                    {
                        "id": event_id,
                        "attempts": current_attempt,
                        "duration": elapsed_ms,
                    },
                )

                # Complete replay event if applicable
                db.execute(
                    text("""
                        UPDATE replay_job_events
                        SET
                            status = 'completed',
                            finished_at = NOW(),
                            error = NULL
                        WHERE
                            event_id = :event_id
                            AND status = 'running'
                    """),
                    {
                        "event_id": event_id,
                    },
                )

                finalize_replay_job_for_event(
                    db,
                    event_id,
                )

                db.commit()

                events_delivered.labels(
                    row.get("provider") or "unknown"
                ).inc()

                publish_update(
                    event_id=event_id,
                    status="delivered",
                    attempt=current_attempt,
                    user_id=row["user_id"],
                    provider=row["provider"],
                    route=row["route"],
                    token=row["token"],
                    created_at=row["created_at"],
                    event_type=row["event_type"],
                    latency_ms=elapsed_ms,
                    payload_size=payload_size,
                )

                return

            except Exception as e:
                print(
                    f"[worker] tunnel error: {e}"
                )

        # =========================
        # DELIVERY TARGETS
        # =========================

        print("Calling router...")

        delivery_payload = {
            **payload,
            "event_id": event_id,
        }

        result = asyncio.run(
            route_webhook_to_targets(
                user_id=user_id,
                webhook_data=delivery_payload,
                provider=row["provider"],
            )
        )

        print("ROUTER RESULT:", result)

        # =========================
        # RESULT
        # =========================

        successful = result.get(
            "successful",
            0,
        )

        failed = result.get(
            "failed",
            0,
        )

        elapsed_ms = round(
            (time.perf_counter() - start) * 1000,
            2,
        )

        final_error = None

        # =========================
        # SUCCESS
        # =========================

        if successful > 0:

            db.execute(
                text("""
                    UPDATE webhook_events
                    SET
                        status = 'delivered',
                        attempt_count = :attempts,
                        delivery_duration = :duration,
                        last_error = NULL,
                        next_retry_at = NULL,
                        processed_at = NOW()
                    WHERE id = :id
                """),
                {
                    "id": event_id,
                    "attempts": current_attempt,
                    "duration": elapsed_ms,
                },
            )

            events_delivered.labels(
                row.get("provider") or "unknown"
            ).inc()

            status = "delivered"

            # Complete replay event
            db.execute(
                text("""
                    UPDATE replay_job_events
                    SET
                        status = 'completed',
                        finished_at = NOW(),
                        error = NULL
                    WHERE
                        event_id = :event_id
                        AND status = 'running'
                """),
                {
                    "event_id": event_id,
                },
            )

            finalize_replay_job_for_event(
                db,
                event_id,
            )

        # =========================
        # FAILURE
        # =========================

        elif failed > 0:

            failed_details = [
                detail
                for detail in result.get(
                    "details",
                    []
                )
                if not detail.get("success")
            ]

            error_messages = []

            for detail in failed_details:

                result_data = (
                    detail.get("result")
                    or {}
                )

                error = (
                    result_data.get("error")
                    or (
                        f"{detail.get('target_type', 'unknown')}"
                        " delivery failed"
                    )
                )

                error_messages.append(
                    str(error)
                )

            delivery_error = (
                "; ".join(error_messages)
                or "delivery failed"
            )

            final_error = delivery_error

            # IMPORTANT:
            # Do NOT increment attempts here.
            #
            # attempt_count was already incremented
            # when the event was claimed.

            attempts = current_attempt

            if attempts >= MAX_RETRIES:

                db.execute(
                    text("""
                        UPDATE webhook_events
                        SET
                            status = 'dlq',
                            attempt_count = :attempts,
                            delivery_duration = :duration,
                            last_error = :error,
                            processed_at = NOW()
                        WHERE id = :id
                    """),
                    {
                        "id": event_id,
                        "attempts": attempts,
                        "duration": elapsed_ms,
                        "error": delivery_error,
                    },
                )

                redis_client.lpush(
                    QUEUE_DLQ,
                    str(event_id),
                )

                status = "dlq"

                db.execute(
                    text("""
                        UPDATE replay_job_events
                        SET
                            status = 'failed',
                            finished_at = NOW(),
                            error = :error
                        WHERE
                            event_id = :event_id
                            AND status = 'running'
                    """),
                    {
                        "event_id": event_id,
                        "error": delivery_error,
                    },
                )

                finalize_replay_job_for_event(
                    db,
                    event_id,
                )

            else:

                retry_at = next_retry_time(
                    attempts
                )

                db.execute(
                    text("""
                        UPDATE webhook_events
                        SET
                            status = 'retrying',
                            attempt_count = :attempts,
                            delivery_duration = :duration,
                            last_error = :error,
                            next_retry_at = :retry_at
                        WHERE id = :id
                    """),
                    {
                        "id": event_id,
                        "attempts": attempts,
                        "duration": elapsed_ms,
                        "error": delivery_error,
                        "retry_at": retry_at,
                    },
                )

                events_retried.labels(
                    row.get("provider") or "unknown"
                ).inc()

                status = "retrying"

            events_failed.labels(
                row.get("provider") or "unknown"
            ).inc()

        # =========================
        # NO DELIVERY TARGETS
        # =========================

        else:

            db.execute(
                text("""
                    UPDATE webhook_events
                    SET
                        status = 'delivered',
                        attempt_count = :attempts,
                        delivery_duration = :duration,
                        last_error = NULL,
                        next_retry_at = NULL,
                        processed_at = NOW()
                    WHERE id = :id
                """),
                {
                    "id": event_id,
                    "attempts": current_attempt,
                    "duration": elapsed_ms,
                },
            )

            events_delivered.labels(
                row.get("provider") or "unknown"
            ).inc()

            status = "delivered"

            db.execute(
                text("""
                    UPDATE replay_job_events
                    SET
                        status = 'completed',
                        finished_at = NOW(),
                        error = NULL
                    WHERE
                        event_id = :event_id
                        AND status = 'running'
                """),
                {
                    "event_id": event_id,
                },
            )

            finalize_replay_job_for_event(
                db,
                event_id,
            )

        # =========================
        # COMMIT
        # =========================

        db.commit()

        publish_update(
            event_id=event_id,
            status=status,
            attempt=current_attempt,
            user_id=row["user_id"],
            provider=row["provider"],
            route=row["route"],
            token=row["token"],
            created_at=row["created_at"],
            event_type=row["event_type"],
            latency_ms=elapsed_ms,
            payload_size=payload_size,
            last_error=final_error,
        )

    except Exception as e:

        db.rollback()

        print(
            f"[worker] Error processing event "
            f"{event_id}: {e}"
        )

        raise

    finally:

        try:
            if row:
                delivery_latency.labels(
                    row.get("provider") or "unknown"
                ).observe(
                    time.perf_counter() - start
                )

        except Exception as e:
            print(
                f"[worker] metrics error: {e}"
            )

        db.close()

# =========================
# REPLAY JOBS
# =========================

def process_replay_job(job_id):
    print(f"[Replay] Processing job {job_id}")

    db = SessionLocal()

    try:
        # =========================
        # MARK JOB STARTED
        # =========================
        db.execute(
            text(
                """
                UPDATE replay_jobs
                SET
                    started_at = COALESCE(started_at, NOW()),
                    finished_at = NULL
                WHERE id = :id
                """
            ),
            {
                "id": job_id,
            },
        )

        db.commit()

        # =========================
        # LOAD REPLAY EVENTS
        # =========================
        replay_events = db.execute(
            text(
                """
                SELECT
                    id,
                    event_id,
                    status
                FROM replay_job_events
                WHERE replay_job_id = :id
                ORDER BY id
                """
            ),
            {
                "id": job_id,
            },
        ).mappings().all()

        if not replay_events:
            print(
                f"[Replay] Job {job_id} has no events"
            )

            db.execute(
                text(
                    """
                    UPDATE replay_jobs
                    SET finished_at = NOW()
                    WHERE id = :id
                    """
                ),
                {
                    "id": job_id,
                },
            )

            db.commit()
            return

        # =========================
        # QUEUE REPLAY EVENTS
        # =========================
        queued_count = 0

        for replay_event in replay_events:

            # Don't queue an event that already completed
            # or permanently failed.
            if replay_event["status"] in (
                "completed",
                "failed",
            ):
                continue

            replay_job_event_id = replay_event["id"]
            event_id = replay_event["event_id"]

            # Mark replay event as running
            db.execute(
                text(
                    """
                    UPDATE replay_job_events
                    SET
                        status = 'running',
                        started_at = COALESCE(
                            started_at,
                            NOW()
                        ),
                        attempt = attempt + 1,
                        error = NULL
                    WHERE id = :id
                    """
                ),
                {
                    "id": replay_job_event_id,
                },
            )

            # Reset original webhook event
            db.execute(
                text(
                    """
                    UPDATE webhook_events
                    SET
                        status = 'pending',
                        last_error = NULL,
                        next_retry_at = NULL,
                        retry_count = 0,
                        attempt_count = 0
                    WHERE id = :id
                    """
                ),
                {
                    "id": event_id,
                },
            )

            # Push to normal webhook worker
            redis_client.lpush(
                QUEUE_MAIN,
                str(event_id),
            )

            queued_count += 1

        db.commit()

        print(
            f"[Replay] Job {job_id} queued "
            f"{queued_count} event(s)"
        )

        # =========================
        # IMPORTANT
        # =========================
        # Do NOT set finished_at here.
        #
        # Events are only queued at this point.
        # deliver_event() will set replay_job_events
        # to completed/failed and will finalize the
        # replay job when all events are finished.

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

def replay_worker():
    while True:
        try:
            result = redis_client.brpop(
                REPLAY_QUEUE,
                timeout=30,
            )

            if result is None:
                continue

            _, raw_job = result

            process_replay_job(raw_job)

        except Exception as e:
            print(f"[replay-worker] {e}")
            time.sleep(2)





# =========================
# RETRY SCHEDULER
# =========================
def retry_scheduler():
    while True:
        db = SessionLocal()

        try:
            rows = db.execute(
                text("""
                    SELECT id
                    FROM webhook_events
                    WHERE status='retrying'
                    AND next_retry_at IS NOT NULL
                    AND next_retry_at <= NOW()
                """)
            ).fetchall()

            for row in rows:
                redis_client.lpush(
                    QUEUE_MAIN,
                    str(row.id)
                )

            db.commit()

        finally:
            db.close()

        time.sleep(5)


# =========================
# MAIN WORKER
# =========================
def main():
    print("[worker] started")

    start_http_server(8001)

    Thread(
        target=retry_scheduler,
        daemon=True,
    ).start()

    Thread(
        target=replay_worker,
        daemon=True,
    ).start()

    while True:

        try:

            result = redis_client.brpop(
                QUEUE_MAIN,
                timeout=30,
            )

            if result is None:
                continue

            _, raw_event = result

            try:

                data = json.loads(raw_event)

                if (
                    isinstance(data, dict)
                    and data.get("batch")
                ):

                    for item in data["events"]:

                        event_id = item.get(
                            "event_id"
                        )

                        if event_id:

                            deliver_event(
                                int(event_id)
                            )

                else:

                    deliver_event(
                        int(raw_event)
                    )

            except Exception:

                deliver_event(
                    int(raw_event)
                )

        except Exception as e:

            print(
                f"[worker] Redis error: {e}"
            )

            time.sleep(2)

if __name__ == "__main__":
    main()