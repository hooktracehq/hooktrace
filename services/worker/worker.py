import requests
import time
import json
from threading import Thread
from sqlalchemy import text
from database import SessionLocal
from redis_client import redis_client
from retry_policy import next_retry_time

from prometheus_client import start_http_server

from metrics import (
    events_delivered,
    events_failed,
    events_retried,
    delivery_latency,
)

QUEUE_MAIN = "webhook:queue"
QUEUE_RETRY = "webhook:retry"
QUEUE_DLQ = "webhook:dlq"


def publish_update(event_id: int, status: str, attempt: int = 0):
    redis_client.publish(
        "events:updates",
        json.dumps({
            "event_id": event_id,
            "status": status,
            "attempt_count": attempt,
        })
    )


def deliver_event(event_id: int):
    db = SessionLocal()

    try:
        row = db.execute(
            text("""
                SELECT 
                    e.*,
                    r.id as route_id,
                    r.token,
                    r.route,
                    r.mode,
                    r.dev_target,
                    r.prod_target
                FROM webhook_events e
                JOIN webhook_routes r ON r.id = e.route_id
                WHERE e.id = :id
            """),
            {"id": event_id},
        ).mappings().first()

        if not row:
            print(f"[worker] Event {event_id} not found")
            return

        targets = db.execute(
            text("""
                SELECT type, config
                FROM webhook_targets
                WHERE route_id = :route_id
            """),
            {"route_id": row["route_id"]},
        ).mappings().all()

        # DEV MODE
        if row["mode"] == "dev":
            try:
                redis_client.publish(
                    f"tunnel:{row['token']}",
                    json.dumps({
                        "headers": row["headers"],
                        "payload": row["payload"],
                        "route": row["route"],
                        "event_id": event_id
                    })
                )

                db.execute(
                    text("UPDATE webhook_events SET status='delivered' WHERE id=:id"),
                    {"id": event_id},
                )
                db.commit()

                events_delivered.inc()
                publish_update(event_id, "delivered", row.get("attempt_count", 0))

                print(f"[worker] forwarded event {event_id} to dev tunnel")
                return

            except Exception as e:
                print(f"[worker] tunnel forwarding failed: {e}")

        # MULTI TARGET DELIVERY
        delivery_failed = False

        for target in targets:

            ttype = target["type"]
            config = target["config"]

            try:

                if ttype == "http":

                    start = time.time()

                    resp = requests.post(
                        config["url"],
                        json=row["payload"],
                        headers=row["headers"],
                        timeout=10,
                    )

                    duration_ms = int((time.time() - start) * 1000)

                    delivery_latency.observe(duration_ms / 1000)

                    db.execute(
                        text("""
                            INSERT INTO webhook_delivery_logs
                            (event_id, status_code, response_body, duration_ms)
                            VALUES (:event_id, :status_code, :body, :duration)
                        """),
                        {
                            "event_id": event_id,
                            "status_code": resp.status_code,
                            "body": resp.text[:2000],
                            "duration": duration_ms,
                        },
                    )

                elif ttype == "redis":

                    redis_client.lpush(
                        config["queue"],
                        json.dumps(row["payload"])
                    )

                elif ttype == "kafka":

                    from kafka import KafkaProducer

                    producer = KafkaProducer(
                        bootstrap_servers=config.get("brokers", "localhost:9092")
                    )

                    producer.send(
                        config["topic"],
                        json.dumps(row["payload"]).encode()
                    )

                    producer.flush()

                elif ttype == "sqs":

                    import boto3

                    sqs = boto3.client("sqs")

                    sqs.send_message(
                        QueueUrl=config["queue_url"],
                        MessageBody=json.dumps(row["payload"])
                    )

                elif ttype == "rabbitmq":

                    import pika

                    connection = pika.BlockingConnection(
                        pika.ConnectionParameters(host=config.get("host", "rabbitmq"))
                    )

                    channel = connection.channel()

                    channel.basic_publish(
                        exchange=config["exchange"],
                        routing_key=config.get("routing_key", ""),
                        body=json.dumps(row["payload"])
                    )

                    connection.close()

                elif ttype == "grpc":
                    print("grpc delivery placeholder")

            except Exception as e:
                delivery_failed = True
                print(f"[worker] delivery failed ({ttype}): {e}")

        # FINAL STATUS UPDATE
        if delivery_failed:

            db.execute(
                text("""
                    UPDATE webhook_events
                    SET status='failed', last_error='multi-target failure'
                    WHERE id=:id
                """),
                {"id": event_id},
            )

            events_failed.inc()

        else:

            db.execute(
                text("UPDATE webhook_events SET status='delivered' WHERE id=:id"),
                {"id": event_id},
            )

            events_delivered.inc()

        db.commit()

        publish_update(event_id, "delivered", row.get("attempt_count", 0))

    finally:
        db.close()


def retry_scheduler():

    print("[worker] retry scheduler started")

    while True:

        db = SessionLocal()

        try:

            rows = db.execute(
                text("""
                    SELECT id FROM webhook_events
                    WHERE status='pending'
                    AND next_retry_at IS NOT NULL
                    AND next_retry_at <= NOW()
                """)
            ).fetchall()

            for row in rows:

                redis_client.lpush(QUEUE_MAIN, str(row.id))

                db.execute(
                    text("UPDATE webhook_events SET next_retry_at=NULL WHERE id=:id"),
                    {"id": row.id},
                )

            db.commit()

        finally:
            db.close()

        time.sleep(5)


def wait_for_services(retries=15, delay=3):

    for i in range(retries):

        try:

            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db.close()

            redis_client.ping()

            print("[worker] connections established")
            return

        except Exception as e:

            print(f"[worker] waiting for services... ({i+1}/{retries}): {e}")
            time.sleep(delay)

    raise RuntimeError("[worker] Could not connect to services")


def main():

    wait_for_services()

    print("[worker] started, waiting for events...")

    start_http_server(8001)

    print("[worker] metrics available on :8001/metrics")

    Thread(target=retry_scheduler, daemon=True).start()

    while True:

        try:

            result = redis_client.brpop(QUEUE_MAIN, timeout=30)

            if result is None:
                continue

            _, raw_event = result

            try:

                data = json.loads(raw_event)

                if isinstance(data, dict) and data.get("batch"):

                    for ev in data["events"]:
                        deliver_event(ev["event_id"])

                else:
                    deliver_event(int(raw_event))

            except Exception:
                deliver_event(int(raw_event))

        except Exception as e:

            print(f"[worker] Redis error: {e}")
            time.sleep(2)


if __name__ == "__main__":
    main()