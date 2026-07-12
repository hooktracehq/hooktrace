import json
import time
import pika


def deliver_rabbitmq(config, payload):
    host = config.get("host", "rabbitmq")

    exchange = config.get("exchange")
    if not exchange:
        raise ValueError("Missing RabbitMQ exchange")

    routing_key = (
        config.get("routingKey")
        or config.get("routing_key")
        or ""
    )

    start = time.time()

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=host)
    )

    channel = connection.channel()

    # Ensure the exchange exists
    channel.exchange_declare(
        exchange=exchange,
        exchange_type="direct",
        durable=True,
    )

    channel.basic_publish(
        exchange=exchange,
        routing_key=routing_key,
        body=json.dumps(payload),
    )

    connection.close()

    duration_ms = int((time.time() - start) * 1000)

    return {
        "status_code": 200,
        "body": "rabbitmq publish",
        "duration_ms": duration_ms,
    }