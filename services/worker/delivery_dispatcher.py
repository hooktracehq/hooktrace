import requests
import json
from redis_client import redis_client
from services.workers.delivery_targets_router import route_webhook_to_targets


def deliver_http(config, payload, headers):
    url = config["url"]

    return requests.post(
        url,
        json=payload,
        headers=headers,
        timeout=10
    )


def deliver_redis(config, payload):
    queue = config["queue"]

    redis_client.lpush(queue, json.dumps(payload))


def deliver_kafka(config, payload):
    from kafka import KafkaProducer

    producer = KafkaProducer(
        bootstrap_servers=config.get("brokers", "localhost:9092")
    )

    producer.send(
        config["topic"],
        json.dumps(payload).encode()
    )

    producer.flush()


def deliver_sqs(config, payload):
    import boto3

    sqs = boto3.client("sqs")

    sqs.send_message(
        QueueUrl=config["queue_url"],
        MessageBody=json.dumps(payload)
    )


def deliver_rabbitmq(config, payload):
    import pika

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=config.get("host", "rabbitmq"))
    )

    channel = connection.channel()

    channel.basic_publish(
        exchange=config["exchange"],
        routing_key=config.get("routing_key", ""),
        body=json.dumps(payload)
    )

    connection.close()


def deliver_grpc(config, payload):
    import grpc

    channel = grpc.insecure_channel(config["endpoint"])

    # placeholder stub
    # depends on protobuf
    print("grpc delivery placeholder")





def dispatch_webhook(webhook_event):
    """
    Main webhook dispatcher
    Routes webhook to configured delivery targets
    """
    user_id = webhook_event.get('user_id')
    provider = webhook_event.get('provider')
    payload = webhook_event.get('payload')
    
    # Route to delivery targets
    result = route_webhook_to_targets(
        user_id=user_id,
        webhook_data=payload,
        provider=provider
    )
    
    print(f"Delivered to {result['successful']} targets, {result['failed']} failed")
    return result