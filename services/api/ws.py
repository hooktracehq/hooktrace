from typing import Dict, List

from fastapi import WebSocket

from services.tunnels.pending_requests import PENDING_RESPONSES


class ConnectionManager:

    def __init__(self):

        # -------------------------------------------------
        # USER-SCOPED CONNECTIONS
        # -------------------------------------------------

        # Customer-facing WebSocket connections.
        #
        # Each authenticated Hooktrace user gets their
        # own connection bucket.
        #
        # Example:
        # {
        #     "user-a-id": [websocket1, websocket2],
        #     "user-b-id": [websocket3],
        # }
        self.user_connections: Dict[str, List[WebSocket]] = {}

        # -------------------------------------------------
        # INTERNAL / SCOPED CONNECTIONS
        # -------------------------------------------------

        # Kept for token/provider/route based subscriptions.
        self.token_connections: Dict[str, List[WebSocket]] = {}
        self.provider_connections: Dict[str, List[WebSocket]] = {}
        self.route_connections: Dict[str, List[WebSocket]] = {}

    # -------------------------------------------------
    # CONNECT
    # -------------------------------------------------

    async def connect(
        self,
        websocket: WebSocket,
        key: str,
        type_: str,
    ):
        await websocket.accept()

        target = self._get_bucket(type_)

        if key not in target:
            target[key] = []

        target[key].append(websocket)

        print(
            f"[WS] Connected type={type_} key={key} "
            f"connections={len(target[key])}"
        )

    # -------------------------------------------------
    # DISCONNECT
    # -------------------------------------------------

    def disconnect(
        self,
        websocket: WebSocket,
        key: str,
        type_: str,
    ):
        target = self._get_bucket(type_)

        if key not in target:
            return

        if websocket not in target[key]:
            return

        target[key].remove(websocket)

        if not target[key]:
            del target[key]

        print(
            f"[WS] Disconnected type={type_} key={key}"
        )

    # -------------------------------------------------
    # GET BUCKET
    # -------------------------------------------------

    def _get_bucket(self, type_: str):
        buckets = {
            "token": self.token_connections,
            "user": self.user_connections,
            "provider": self.provider_connections,
            "route": self.route_connections,
        }

        if type_ not in buckets:
            raise ValueError(
                f"Unknown WebSocket connection type: {type_}"
            )

        return buckets[type_]

    # -------------------------------------------------
    # SEND
    # -------------------------------------------------

    async def send(
        self,
        key: str,
        data,
        type_: str,
    ):
        target = self._get_bucket(type_)

        connections = list(target.get(key, []))

        if not connections:
            return

        dead_connections = []

        for websocket in connections:

            try:
                await websocket.send_json(data)

            except Exception as error:
                print(
                    f"[WS] Failed to send "
                    f"type={type_} key={key}: {error}"
                )

                dead_connections.append(websocket)

        # Remove dead connections safely.
        for websocket in dead_connections:

            self.disconnect(
                websocket,
                key,
                type_,
            )

    # -------------------------------------------------
    # USER EVENT
    # -------------------------------------------------

    async def send_to_user(
        self,
        user_id: str,
        data,
    ):
        """
        Send an event only to connections belonging
        to the authenticated Hooktrace user.
        """

        await self.send(
            str(user_id),
            data,
            "user",
        )

    # -------------------------------------------------
    # HANDLE TUNNEL RESPONSE
    # -------------------------------------------------

    async def handle_tunnel_response(
        self,
        data: dict,
    ):
        request_id = data.get("request_id")

        if not request_id:
            return

        future = PENDING_RESPONSES.get(request_id)

        if future and not future.done():
            future.set_result(data)

        PENDING_RESPONSES.pop(
            request_id,
            None,
        )

    # -------------------------------------------------
    # BROADCAST EVENT
    # -------------------------------------------------

    async def broadcast_event(
        self,
        event: dict,
    ):
        """
        Broadcast a realtime Hooktrace event.

        Customer-facing events are user-scoped.

        Internal consumers may additionally subscribe
        by token, provider, or route.
        """

        print(
            "[WS] Broadcasting event:",
            event,
        )

        # -------------------------------------------------
        # USER-SCOPED STREAM
        # -------------------------------------------------

        user_id = event.get("user_id")

        print(
            "[WS] Event user_id:",
            user_id,
        )

        if user_id:

            await self.send_to_user(
                str(user_id),
                event,
            )

        # -------------------------------------------------
        # TOKEN-SCOPED STREAM
        # -------------------------------------------------

        token = event.get("token")

        if token:

            await self.send(
                str(token),
                event,
                "token",
            )

        # -------------------------------------------------
        # PROVIDER-SCOPED INTERNAL STREAM
        # -------------------------------------------------

        provider = event.get("provider")

        if provider:

            await self.send(
                str(provider),
                event,
                "provider",
            )

        # -------------------------------------------------
        # ROUTE-SCOPED INTERNAL STREAM
        # -------------------------------------------------

        route = event.get("route")

        if route:

            await self.send(
                str(route),
                event,
                "route",
            )

    # -------------------------------------------------
    # CONNECTION STATS
    # -------------------------------------------------

    def stats(self):

        return {
            "users": len(self.user_connections),
            "tokens": len(self.token_connections),
            "providers": len(self.provider_connections),
            "routes": len(self.route_connections),

            "total_connections": (
                sum(
                    len(connections)
                    for connections in self.user_connections.values()
                )
                + sum(
                    len(connections)
                    for connections in self.token_connections.values()
                )
                + sum(
                    len(connections)
                    for connections in self.provider_connections.values()
                )
                + sum(
                    len(connections)
                    for connections in self.route_connections.values()
                )
            ),
        }


# -------------------------------------------------
# GLOBAL CONNECTION MANAGER
# -------------------------------------------------

manager = ConnectionManager()