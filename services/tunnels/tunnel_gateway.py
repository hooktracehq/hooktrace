import json

from fastapi import APIRouter
from fastapi import WebSocket
from fastapi import WebSocketDisconnect

from services.api.ws import manager


router = APIRouter(tags=["tunnel-gateway"])


@router.websocket("/ws/tunnel/{token}")
async def tunnel_gateway(
    websocket: WebSocket,
    token: str,
):

    print("===== TUNNEL GATEWAY CONNECTED =====")
    await manager.connect(
        websocket,
        token,
        "token",
    )
    print(manager.token_connections)

    print(f"[gateway] tunnel connected: {token}")

    try:

        while True:

            raw = await websocket.receive_text()

            data = await websocket.receive_json()

            message_type = data.get("type")

            if message_type == "heartbeat":
                continue

            if message_type == "response":

                await manager.handle_tunnel_response(
                    data
                )

    except WebSocketDisconnect:

        print(
            f"[gateway] tunnel disconnected: {token}"
        )

    finally:

        manager.disconnect(
            websocket,
            token,
            "token",
        )