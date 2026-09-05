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


# =========================================================
# REALTIME UPDATES
# =========================================================

def publish_update(
    event_id,
    status,
    attempt=0,
    user_id=None,
    provider=None,
    route=None,
    token=None,
    created_at=None,
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

            "user_id": (
                str(user_id)
                if user_id
                else None
            ),

            "provider": provider,
            "route": route,
            "token": token,

            "created_at": (
                created_at.isoformat()
                if created_at
                else None
            ),

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
        print(
            f"[publish_update] ERROR: {e}"
        )


# =========================================================
# REPLAY HELPERS
# =========================================================

def get_replay_job_status(
    db,
    replay_job_id,
):
    """
    Get the current parent replay job status.
    """

    return db.execute(
        text(
            """
            SELECT status
            FROM replay_jobs
            WHERE id = :job_id
            """
        ),
        {
            "job_id": replay_job_id,
        },
    ).scalar()


def is_replay_cancelled(
    db,
    replay_job_id,
):
    """
    Return True when a replay job has been cancelled.
    """

    status = get_replay_job_status(
        db,
        replay_job_id,
    )

    return status == "cancelled"


def finalize_replay_job_for_event(
    db,
    event_id: int,
):
    """
    Finalize replay jobs associated with this event
    once all replay events reach a terminal state.

    Cancelled replay events are also terminal.
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
                        'failed',
                        'cancelled'
                    )
                """
            ),
            {
                "job_id": job_id,
            },
        ).scalar()

        if unfinished == 0:

            # Don't overwrite a cancelled job.
            db.execute(
                text(
                    """
                    UPDATE replay_jobs
                    SET
                        finished_at = COALESCE(
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


# =========================================================
# EVENT DELIVERY
# =========================================================

def deliver_event(
    event_id: int,
    replay_job_id=None,
):
    print("worker started")

    start = time.perf_counter()
    row = None

    db = SessionLocal()

    try:

        # =================================================
        # REPLAY CANCELLATION CHECK
        # =================================================

        if replay_job_id is not None:

            if is_replay_cancelled(
                db,
                replay_job_id,
            ):
                print(
                    f"[Replay] Job "
                    f"{replay_job_id} "
                    f"was cancelled. "
                    f"Skipping event {event_id}."
                )
                return

        # =================================================
        # CLAIM EVENT
        # =================================================

        print(
            f"Trying to claim event {event_id}"
        )

        claimed = db.execute(
            text(
                """
                UPDATE webhook_events
                SET
                    status = 'processing',
                    attempt_count =
                        COALESCE(
                            attempt_count,
                            0
                        ) + 1
                WHERE
                    id = :id
                    AND status IN (
                        'pending',
                        'queued',
                        'retrying'
                    )
                """
            ),
            {
                "id": event_id,
            },
        )

        print(
            "claimed rows:",
            claimed.rowcount,
        )

        if claimed.rowcount == 0:
            db.rollback()
            return

        db.commit()

        # =================================================
        # LOAD EVENT
        # =================================================

        row = db.execute(
            text(
                """
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
                """
            ),
            {
                "id": event_id,
            },
        ).mappings().first()

        print(
            "loaded row:",
            row,
        )

        if not row:
            print(
                f"[worker] Event "
                f"{event_id} not found"
            )
            return

        user_id = row["user_id"]

        current_attempt = (
            row.get("attempt_count")
            or 1
        )

        # =================================================
        # CHECK REPLAY AGAIN
        # =================================================
        #
        # This protects against:
        #
        # worker starts
        #       ↓
        # user clicks Cancel
        #       ↓
        # worker continues
        #

        if replay_job_id is not None:

            if is_replay_cancelled(
                db,
                replay_job_id,
            ):
                print(
                    f"[Replay] Job "
                    f"{replay_job_id} "
                    f"was cancelled after "
                    f"claiming event {event_id}."
                )

                # Return the event to a safe state.
                db.execute(
                    text(
                        """
                        UPDATE webhook_events
                        SET
                            status = 'pending'
                        WHERE id = :event_id
                        """
                    ),
                    {
                        "event_id": event_id,
                    },
                )

                db.commit()

                return

        # =================================================
        # PAYLOAD
        # =================================================

        payload = row["payload"]

        if isinstance(payload, str):

            try:
                payload = json.loads(
                    payload
                )
            except Exception:
                payload = {}

        if payload is None:
            payload = {}

        payload_size = 0

        try:
            payload_size = len(
                json.dumps(
                    payload
                ).encode("utf-8")
            )
        except Exception:
            pass

        # =================================================
        # HEADERS
        # =================================================

        headers = row["headers"]

        if isinstance(headers, str):

            try:
                headers = json.loads(
                    headers
                )
            except Exception:
                headers = {}

        if headers is None:
            headers = {}

        # =================================================
        # REALTIME PROCESSING
        # =================================================

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

        # =================================================
        # AGGREGATION
        # =================================================

        try:

            print(
                "loading aggregation rules"
            )

            rules = db.execute(
                text(
                    """
                    SELECT
                        id,
                        event_patterns,
                        provider
                    FROM aggregation_rules
                    WHERE
                        user_id = :user_id
                        AND enabled = TRUE
                    """
                ),
                {
                    "user_id": user_id,
                },
            ).mappings().all()

            print(
                "aggregation rules loaded",
                len(rules),
            )

            db.commit()

        except Exception as e:

            print(
                f"[worker] "
                f"aggregation error: {e}"
            )

        # =================================================
        # DEV MODE
        # =================================================

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
                    (
                        time.perf_counter()
                        - start
                    ) * 1000,
                    2,
                )

                db.execute(
                    text(
                        """
                        UPDATE webhook_events
                        SET
                            status = 'delivered',
                            attempt_count = :attempts,
                            delivery_duration = :duration,
                            last_error = NULL,
                            next_retry_at = NULL,
                            processed_at = NOW()
                        WHERE id = :id
                        """
                    ),
                    {
                        "id": event_id,
                        "attempts": current_attempt,
                        "duration": elapsed_ms,
                    },
                )

                # Complete replay event
                if replay_job_id is not None:

                    db.execute(
                        text(
                            """
                            UPDATE replay_job_events
                            SET
                                status = 'completed',
                                finished_at = NOW(),
                                error = NULL
                            WHERE
                                replay_job_id = :job_id
                                AND event_id = :event_id
                                AND status = 'running'
                            """
                        ),
                        {
                            "job_id": replay_job_id,
                            "event_id": event_id,
                        },
                    )

                else:

                    db.execute(
                        text(
                            """
                            UPDATE replay_job_events
                            SET
                                status = 'completed',
                                finished_at = NOW(),
                                error = NULL
                            WHERE
                                event_id = :event_id
                                AND status = 'running'
                            """
                        ),
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
                    row.get("provider")
                    or "unknown"
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
                    f"[worker] "
                    f"tunnel error: {e}"
                )

        # =================================================
        # DELIVERY TARGETS
        # =================================================

        delivery_payload = {
            **payload,
            "event_id": event_id,
        }

        result = asyncio.run(
    route_webhook_to_targets(
        user_id=str(row["user_id"]),
        route_id=row["route_id"],
        webhook_data=delivery_payload,
        provider=row["provider"],
        event_attempt=current_attempt,
    )
)

        print(
            "ROUTER RESULT:",
            result,
        )

        successful = result.get(
            "successful",
            0,
        )

        failed = result.get(
            "failed",
            0,
        )

        elapsed_ms = round(
            (
                time.perf_counter()
                - start
            ) * 1000,
            2,
        )

        final_error = None

        # =================================================
        # SUCCESS
        # =================================================

        if failed == 0 and successful > 0:

            db.execute(
                text(
                    """
                    UPDATE webhook_events
                    SET
                        status = 'delivered',
                        attempt_count = :attempts,
                        delivery_duration = :duration,
                        last_error = NULL,
                        next_retry_at = NULL,
                        processed_at = NOW()
                    WHERE id = :id
                    """
                ),
                {
                    "id": event_id,
                    "attempts": current_attempt,
                    "duration": elapsed_ms,
                },
            )

            events_delivered.labels(
                row.get("provider")
                or "unknown"
            ).inc()

            status = "delivered"

            if replay_job_id is not None:

                db.execute(
                    text(
                        """
                        UPDATE replay_job_events
                        SET
                            status = 'completed',
                            finished_at = NOW(),
                            error = NULL
                        WHERE
                            replay_job_id = :job_id
                            AND event_id = :event_id
                            AND status = 'running'
                        """
                    ),
                    {
                        "job_id": replay_job_id,
                        "event_id": event_id,
                    },
                )

            else:

                db.execute(
                    text(
                        """
                        UPDATE replay_job_events
                        SET
                            status = 'completed',
                            finished_at = NOW(),
                            error = NULL
                        WHERE
                            event_id = :event_id
                            AND status = 'running'
                        """
                    ),
                    {
                        "event_id": event_id,
                    },
                )

            finalize_replay_job_for_event(
                db,
                event_id,
            )

        # =================================================
        # FAILURE
        # =================================================

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

            attempts = current_attempt

            if attempts >= MAX_RETRIES:

                db.execute(
                    text(
                        """
                        UPDATE webhook_events
                        SET
                            status = 'dlq',
                            attempt_count = :attempts,
                            delivery_duration = :duration,
                            last_error = :error,
                            next_retry_at = NULL,
                            processed_at = NOW()
                        WHERE id = :id
                        """
                    ),
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

                if replay_job_id is not None:

                    db.execute(
                        text(
                            """
                            UPDATE replay_job_events
                            SET
                                status = 'failed',
                                finished_at = NOW(),
                                error = :error
                            WHERE
                                replay_job_id = :job_id
                                AND event_id = :event_id
                                AND status = 'running'
                            """
                        ),
                        {
                            "job_id": replay_job_id,
                            "event_id": event_id,
                            "error": delivery_error,
                        },
                    )

                else:

                    db.execute(
                        text(
                            """
                            UPDATE replay_job_events
                            SET
                                status = 'failed',
                                finished_at = NOW(),
                                error = :error
                            WHERE
                                event_id = :event_id
                                AND status = 'running'
                            """
                        ),
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
                    text(
                        """
                            UPDATE webhook_events
SET
    status = 'retrying',
    attempt_count = :attempts,
    retry_count = GREATEST(:attempts - 1, 0),
    delivery_duration = :duration,
    last_error = :error,
    next_retry_at = :retry_at
                        """
                    ),
                    {
                        "id": event_id,
                        "attempts": attempts,
                        "duration": elapsed_ms,
                        "error": delivery_error,
                        "retry_at": retry_at,
                    },
                )

                events_retried.labels(
                    row.get("provider")
                    or "unknown"
                ).inc()

                status = "retrying"

            events_failed.labels(
                row.get("provider")
                or "unknown"
            ).inc()

        # =================================================
# NO DELIVERY TARGETS
# =================================================

        else:

            final_error = (
                "No active delivery targets configured "
                "for this route"
            )

            db.execute(
                text(
                    """
                    UPDATE webhook_events
                    SET
                        status = 'failed',
                        attempt_count = :attempts,
                        delivery_duration = :duration,
                        last_error = :error,
                        next_retry_at = NULL,
                        processed_at = NOW()
                    WHERE id = :id
                    """
                ),
                {
                    "id": event_id,
                    "attempts": current_attempt,
                    "duration": elapsed_ms,
                    "error": final_error,
                },
            )

            events_failed.labels(
                row.get("provider")
                or "unknown"
            ).inc()

            status = "failed"

            if replay_job_id is not None:

                db.execute(
                    text(
                        """
                        UPDATE replay_job_events
                        SET
                            status = 'failed',
                            finished_at = NOW(),
                            error = :error
                        WHERE
                            replay_job_id = :job_id
                            AND event_id = :event_id
                            AND status = 'running'
                        """
                    ),
                    {
                        "job_id": replay_job_id,
                        "event_id": event_id,
                        "error": final_error,
                    },
                )

            else:

                db.execute(
                    text(
                        """
                        UPDATE replay_job_events
                        SET
                            status = 'failed',
                            finished_at = NOW(),
                            error = :error
                        WHERE
                            event_id = :event_id
                            AND status = 'running'
                        """
                    ),
                    {
                        "event_id": event_id,
                        "error": final_error,
                    },
                )

            finalize_replay_job_for_event(
                db,
                event_id,
            )

        # =================================================
        # COMMIT
        # =================================================

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
            f"[worker] Error processing "
            f"event {event_id}: {e}"
        )

        raise

    finally:

        try:

            if row:

                delivery_latency.labels(
                    row.get("provider")
                    or "unknown"
                ).observe(
                    time.perf_counter()
                    - start
                )

        except Exception as e:

            print(
                f"[worker] metrics error: {e}"
            )

        db.close()


# =========================================================
# REPLAY JOB PROCESSOR
# =========================================================

def process_replay_job(
    job_id,
):
    print(
        f"[Replay] Processing job {job_id}"
    )

    db = SessionLocal()

    try:

        # =================================================
        # FIRST CANCELLATION CHECK
        # =================================================

        job_status = get_replay_job_status(
            db,
            job_id,
        )

        if job_status == "cancelled":

            print(
                f"[Replay] Job {job_id} "
                "was cancelled before processing. "
                "Skipping."
            )

            return

        if job_status is None:

            print(
                f"[Replay] Job {job_id} "
                "does not exist."
            )

            return

        # =================================================
        # DON'T PROCESS ALREADY FINISHED JOBS
        # =================================================

        if job_status in (
            "completed",
            "failed",
        ):

            print(
                f"[Replay] Job {job_id} "
                f"is already {job_status}. "
                "Skipping."
            )

            return

        # =================================================
        # MARK JOB RUNNING
        # =================================================

        db.execute(
            text(
                """
                UPDATE replay_jobs
                SET
                    status = 'running',
                    started_at = COALESCE(
                        started_at,
                        NOW()
                    )
                WHERE
                    id = :id
                    AND status = 'queued'
                """
            ),
            {
                "id": job_id,
            },
        )

        db.commit()

        # =================================================
        # CHECK AGAIN AFTER MARKING RUNNING
        # =================================================

        job_status = get_replay_job_status(
            db,
            job_id,
        )

        if job_status == "cancelled":

            print(
                f"[Replay] Job {job_id} "
                "was cancelled. "
                "Stopping."
            )

            return

        # =================================================
        # LOAD REPLAY EVENTS
        # =================================================

        replay_events = db.execute(
            text(
                """
                SELECT
                    id,
                    event_id,
                    status
                FROM replay_job_events
                WHERE
                    replay_job_id = :id
                ORDER BY id
                """
            ),
            {
                "id": job_id,
            },
        ).mappings().all()

        if not replay_events:

            print(
                f"[Replay] Job {job_id} "
                "has no events"
            )

            db.execute(
                text(
                    """
                    UPDATE replay_jobs
                    SET
                        status = 'completed',
                        finished_at = NOW()
                    WHERE
                        id = :id
                        AND status != 'cancelled'
                    """
                ),
                {
                    "id": job_id,
                },
            )

            db.commit()

            return

        # =================================================
        # PROCESS REPLAY EVENTS
        # =================================================

        queued_count = 0

        for replay_event in replay_events:

            # =================================================
            # CHECK CANCELLATION BEFORE EVERY EVENT
            # =================================================

            job_status = get_replay_job_status(
                db,
                job_id,
            )

            if job_status == "cancelled":

                print(
                    f"[Replay] Job {job_id} "
                    "cancelled while processing. "
                    "Stopping."
                )

                # Cancel events that haven't started.
                db.execute(
                    text(
                        """
                        UPDATE replay_job_events
                        SET
                            status = 'cancelled',
                            finished_at = COALESCE(
                                finished_at,
                                NOW()
                            )
                        WHERE
                            replay_job_id = :job_id
                            AND status = 'queued'
                        """
                    ),
                    {
                        "job_id": job_id,
                    },
                )

                db.commit()

                return

            # Don't reprocess terminal events.
            if replay_event["status"] in (
                "completed",
                "failed",
                "cancelled",
            ):
                continue

            replay_job_event_id = (
                replay_event["id"]
            )

            event_id = (
                replay_event["event_id"]
            )

            # =================================================
            # MARK REPLAY EVENT RUNNING
            # =================================================

            updated = db.execute(
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
                    WHERE
                        id = :id
                        AND status = 'queued'
                        AND EXISTS (
                            SELECT 1
                            FROM replay_jobs
                            WHERE
                                id = :job_id
                                AND status != 'cancelled'
                        )
                    """
                ),
                {
                    "id": replay_job_event_id,
                    "job_id": job_id,
                },
            )

            if updated.rowcount == 0:

                print(
                    f"[Replay] Event "
                    f"{event_id} was not "
                    "started because job "
                    f"{job_id} was cancelled."
                )

                continue

            # =================================================
            # RESET ORIGINAL EVENT
            # =================================================

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
                    WHERE
                        id = :id
                    """
                ),
                {
                    "id": event_id,
                },
            )

            db.commit()

            # =================================================
            # PUSH TO NORMAL WORKER
            #
            # IMPORTANT:
            # Include replay_job_id so deliver_event()
            # knows which replay job owns this event.
            # =================================================

            replay_message = json.dumps(
                {
                    "event_id": event_id,
                    "replay_job_id": str(job_id),
                }
            )

            redis_client.lpush(
                QUEUE_MAIN,
                replay_message,
            )

            queued_count += 1

        print(
            f"[Replay] Job {job_id} "
            f"queued {queued_count} event(s)"
        )

        # IMPORTANT:
        # Do not mark the job completed here.
        #
        # deliver_event() will complete/fail each
        # replay_job_event and finalize the parent job.

    except Exception:

        db.rollback()

        print(
            f"[Replay] Job {job_id} "
            "failed unexpectedly"
        )

        raise

    finally:

        db.close()


# =========================================================
# REPLAY WORKER
# =========================================================

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

            process_replay_job(
                raw_job
            )

        except Exception as e:

            print(
                f"[replay-worker] {e}"
            )

            time.sleep(2)


# =========================================================
# RETRY SCHEDULER
# =========================================================

def retry_scheduler():

    while True:

        db = SessionLocal()

        try:
            rows = db.execute(
                text(
                    """
                    SELECT id
                    FROM webhook_events
                    WHERE
                        status = 'retrying'
                        AND next_retry_at IS NOT NULL
                        AND next_retry_at <= NOW()
                    """
                )
            ).fetchall()

            for row in rows:
                redis_client.lpush(
                    QUEUE_MAIN,
                    str(row.id),
                )

            db.commit()

        except Exception as e:
            db.rollback()
            print(
                f"[retry-scheduler] ERROR: {e}"
            )

        finally:
            db.close()

        time.sleep(5)

# =========================================================
# MAIN WORKER
# =========================================================

def main():

    print(
        "[worker] started"
    )

    start_http_server(
        8001
    )

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

                data = json.loads(
                    raw_event
                )

                # -----------------------------------------
                # Replay event message
                # -----------------------------------------

                if (
                    isinstance(data, dict)
                    and data.get("event_id")
                ):

                    event_id = int(
                        data["event_id"]
                    )

                    replay_job_id = (
                        data.get(
                            "replay_job_id"
                        )
                    )

                    deliver_event(
                        event_id,
                        replay_job_id,
                    )

                # -----------------------------------------
                # Batch message
                # -----------------------------------------

                elif (
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

                # -----------------------------------------
                # Normal event
                # -----------------------------------------

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