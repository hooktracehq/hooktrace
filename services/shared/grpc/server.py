import json
from concurrent import futures

import grpc

from services.shared.grpc import webhook_pb2
from services.shared.grpc import webhook_pb2_grpc


class WebhookService(
    webhook_pb2_grpc.WebhookServiceServicer
):

    # Rename to Deliver if that's what your .proto defines
    def SendWebhook(
        self,
        request,
        context,
    ):
        print("=" * 60)
        print("gRPC WEBHOOK RECEIVED")
        print("=" * 60)

        print("Event:", request.event)
        print("Provider:", request.provider)
        print("Timestamp:", request.timestamp)

        try:
            payload = json.loads(request.payload)

            print("\nPayload:")
            print(
                json.dumps(
                    payload,
                    indent=2,
                )
            )

        except json.JSONDecodeError:
            print("\nRaw payload:")
            print(request.payload)

        print("=" * 60)

        return webhook_pb2.WebhookResponse(
            success=True,
            message="Webhook received successfully",
        )


def serve():
    server = grpc.server(
        futures.ThreadPoolExecutor(
            max_workers=10
        )
    )

    webhook_pb2_grpc.add_WebhookServiceServicer_to_server(
        WebhookService(),
        server,
    )

    server.add_insecure_port("[::]:50051")

    server.start()

    print("=" * 60)
    print("🚀 gRPC Test Server running on port 50051")
    print("=" * 60)

    server.wait_for_termination()


if __name__ == "__main__":
    serve()