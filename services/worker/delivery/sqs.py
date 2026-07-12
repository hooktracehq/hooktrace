import json
import time

import boto3


def deliver_sqs(config, payload):
    queue_url = (
        config.get("queueUrl")
        or config.get("queue_url")
    )

    if not queue_url:
        raise ValueError(
            "Missing SQS queue URL (queueUrl)"
        )

    client_kwargs = {}

    # Region
    region = config.get("region")
    if region:
        client_kwargs["region_name"] = region

    # LocalStack endpoint (optional)
    endpoint_url = (
        config.get("endpointUrl")
        or config.get("endpoint_url")
    )

    if endpoint_url:
        client_kwargs["endpoint_url"] = endpoint_url

        # LocalStack accepts any credentials
        client_kwargs["aws_access_key_id"] = (
            config.get("accessKeyId")
            or "test"
        )

        client_kwargs["aws_secret_access_key"] = (
            config.get("secretAccessKey")
            or "test"
        )

    else:
        # Production AWS credentials
        access_key = (
            config.get("accessKeyId")
            or config.get("access_key_id")
        )

        secret_key = (
            config.get("secretAccessKey")
            or config.get("secret_access_key")
        )

        if access_key and secret_key:
            client_kwargs["aws_access_key_id"] = access_key
            client_kwargs["aws_secret_access_key"] = secret_key

    start = time.perf_counter()

    sqs = boto3.client(
        "sqs",
        **client_kwargs,
    )

    message = {
        "QueueUrl": queue_url,
        "MessageBody": json.dumps(payload),
    }

    message_group_id = (
        config.get("messageGroupId")
        or config.get("message_group_id")
    )

    if message_group_id:
        message["MessageGroupId"] = message_group_id

    response = sqs.send_message(**message)

    duration_ms = round(
        (time.perf_counter() - start) * 1000,
        2,
    )

    return {
        "status_code": 200,
        "body": json.dumps(
            {
                "message": "sqs message",
                "message_id": response.get("MessageId"),
            }
        ),
        "duration_ms": duration_ms,
    }