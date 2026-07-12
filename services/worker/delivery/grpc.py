import json
import time

import grpc

from services.shared.grpc import webhook_pb2
from services.shared.grpc import webhook_pb2_grpc

def deliver_grpc(config, payload):
    endpoint = (
        config.get("grpcUrl")
        or config.get("endpoint")
    )

    if not endpoint:
        raise ValueError(
            "Missing gRPC endpoint"
        )

    start = time.perf_counter()

    channel = grpc.insecure_channel(endpoint)

    try:
        grpc.channel_ready_future(channel).result(
            timeout=5
        )

        stub = webhook_pb2_grpc.WebhookServiceStub(
            channel
        )

        response = stub.SendWebhook(
            webhook_pb2.WebhookRequest(
                event=payload.get("event", ""),
                provider=payload.get("provider", ""),
                timestamp=payload.get("timestamp", ""),
                payload=json.dumps(payload),
            )
        )

        duration_ms = round(
            (time.perf_counter() - start) * 1000,
            2,
        )

        return {
            "status_code": 200,
            "body": response.message,
            "duration_ms": duration_ms,
        }

    except grpc.RpcError as exc:
        raise RuntimeError(
            f"{exc.code().name}: {exc.details()}"
        ) from exc

    finally:
        channel.close()