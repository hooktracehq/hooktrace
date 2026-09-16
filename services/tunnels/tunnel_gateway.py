from fastapi import APIRouter
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from sqlalchemy import text

from services.api.database import SessionLocal
from services.api.ws import manager


router = APIRouter(tags=["tunnel-gateway"])


def update_tunnel_status(
    token: str,
    status: str,
):
    db = SessionLocal()

    try:
        db.execute(
            text("""
                UPDATE dev_tunnels
                SET status = :status
                WHERE token = :token
            """),
            {
                "token": token,
                "status": status,
            },
        )

        db.commit()

        print(
            f"[gateway] tunnel {token} -> {status}"
        )

    except Exception as error:
        db.rollback()

        print(
            f"[gateway] failed to update tunnel "
            f"{token} -> {status}: {error}"
        )

    finally:
        db.close()


@router.websocket("/ws/tunnel/{token}")
async def tunnel_gateway(
    websocket: WebSocket,
    token: str,
):
    print(
        "===== TUNNEL GATEWAY CONNECTED ====="
    )

    await manager.connect(
        websocket,
        token,
        "token",
    )

    print(manager.token_connections)

    # CLI is now actually connected.
    update_tunnel_status(
        token,
        "active",
    )

    print(
        f"[gateway] tunnel connected: {token}"
    )

    try:

        while True:

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

        # Only mark the tunnel offline if there
        # are no remaining CLI connections.
        remaining_connections = (
            manager.token_connections.get(token)
        )

        if not remaining_connections:

            update_tunnel_status(
                token,
                "offline",
            )