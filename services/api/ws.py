# from typing import Dict, List

# from fastapi import WebSocket

# from services.tunnels.pending_requests import PENDING_RESPONSES


# class ConnectionManager:

#     def __init__(self):

#         # Global live stream (/ws/events)
#         self.global_connections: List[WebSocket] = []

#         # Scoped streams
#         self.token_connections: Dict[str, List[WebSocket]] = {}
#         self.user_connections: Dict[str, List[WebSocket]] = {}
#         self.provider_connections: Dict[str, List[WebSocket]] = {}
#         self.route_connections: Dict[str, List[WebSocket]] = {}

#     # -------------------------------------------------
#     # CONNECT
#     # -------------------------------------------------

#     async def connect(
#         self,
#         websocket: WebSocket,
#         key: str,
#         type_: str,
#     ):

#         await websocket.accept()

#         if type_ == "global":
#             self.global_connections.append(websocket)
#             return

#         target = self._get_bucket(type_)

#         if key not in target:
#             target[key] = []

#         target[key].append(websocket)

#     # -------------------------------------------------
#     # DISCONNECT
#     # -------------------------------------------------

#     def disconnect(
#         self,
#         websocket: WebSocket,
#         key: str,
#         type_: str,
#     ):

#         if type_ == "global":

#             if websocket in self.global_connections:
#                 self.global_connections.remove(websocket)

#             return

#         target = self._get_bucket(type_)

#         if (
#             key in target
#             and websocket in target[key]
#         ):

#             target[key].remove(websocket)

#             if not target[key]:
#                 del target[key]

#     # -------------------------------------------------
#     # GET BUCKET
#     # -------------------------------------------------

#     def _get_bucket(self, type_: str):

#         return {
#             "token": self.token_connections,
#             "user": self.user_connections,
#             "provider": self.provider_connections,
#             "route": self.route_connections,
#         }[type_]

#     # -------------------------------------------------
#     # SEND
#     # -------------------------------------------------

#     async def send(
#         self,
#         key: str,
#         data,
#         type_: str,
#     ):

#         target = self._get_bucket(type_)

#         dead_connections = []

#         for ws in target.get(key, []):

#             try:
#                 await ws.send_json(data)

#             except Exception:
#                 dead_connections.append(ws)

#         for ws in dead_connections:

#             self.disconnect(
#                 ws,
#                 key,
#                 type_,
#             )

#     # -------------------------------------------------
#     # GLOBAL BROADCAST
#     # -------------------------------------------------

#     async def broadcast_global(
#         self,
#         data,
#     ):

#         dead_connections = []

#         for ws in self.global_connections:

#             try:
#                 await ws.send_json(data)

#             except Exception:
#                 dead_connections.append(ws)

#         for ws in dead_connections:

#             if ws in self.global_connections:
#                 self.global_connections.remove(ws)

#     # -------------------------------------------------
#     # HANDLE TUNNEL RESPONSE
#     # -------------------------------------------------

#     async def handle_tunnel_response(
#         self,
#         data: dict,
#     ):

#         request_id = data.get("request_id")

#         future = PENDING_RESPONSES.get(request_id)

#         if future and not future.done():
#             future.set_result(data)

#         PENDING_RESPONSES.pop(
#             request_id,
#             None,
#         )

#     # -------------------------------------------------
#     # BROADCAST EVENT
#     # -------------------------------------------------

#     async def broadcast_event(
#         self,
#         event: dict,
#     ):

#         # Broadcast to every live stream connection
#         await self.broadcast_global(event)

#         # Token-specific stream
#         token = event.get("token")

#         if token:

#             await self.send(
#                 token,
#                 event,
#                 "token",
#             )

#         # User-specific stream
#         user_id = event.get("user_id")

#         if user_id:

#             await self.send(
#                 str(user_id),
#                 event,
#                 "user",
#             )

#         # Provider-specific stream
#         provider = event.get("provider")

#         if provider:

#             await self.send(
#                 provider,
#                 event,
#                 "provider",
#             )

#         # Route-specific stream
#         route = event.get("route")

#         if route:

#             await self.send(
#                 route,
#                 event,
#                 "route",
#             )

#     # -------------------------------------------------
#     # CONNECTION STATS
#     # -------------------------------------------------

#     def stats(self):

#         return {
#             "global": len(self.global_connections),
#             "tokens": len(self.token_connections),
#             "users": len(self.user_connections),
#             "providers": len(self.provider_connections),
#             "routes": len(self.route_connections),

#             "total_connections": (
#                 len(self.global_connections)
#                 + sum(
#                     len(v)
#                     for v in self.token_connections.values()
#                 )
#                 + sum(
#                     len(v)
#                     for v in self.user_connections.values()
#                 )
#                 + sum(
#                     len(v)
#                     for v in self.provider_connections.values()
#                 )
#                 + sum(
#                     len(v)
#                     for v in self.route_connections.values()
#                 )
#             ),
#         }


# manager = ConnectionManager()






from typing import Dict, List

from fastapi import WebSocket

from services.tunnels.pending_requests import PENDING_RESPONSES


class ConnectionManager:

    def __init__(self):

        # User-scoped live streams.
        #
        # Each user has their own WebSocket connections.
        #
        # Example:
        # {
        #     "user-a-id": [websocket1, websocket2],
        #     "user-b-id": [websocket3],
        # }
        self.user_connections: Dict[str, List[WebSocket]] = {}

        # Internal/scoped connections.
        #
        # These are kept because other Hooktrace functionality
        # may use token/provider/route based subscriptions.
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

        if (
            key in target
            and websocket in target[key]
        ):
            target[key].remove(websocket)

            if not target[key]:
                del target[key]

    # -------------------------------------------------
    # GET BUCKET
    # -------------------------------------------------

    def _get_bucket(self, type_: str):
        return {
            "token": self.token_connections,
            "user": self.user_connections,
            "provider": self.provider_connections,
            "route": self.route_connections,
        }[type_]

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

        dead_connections = []

        for websocket in list(target.get(key, [])):

            try:
                await websocket.send_json(data)

            except Exception:
                dead_connections.append(websocket)

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

    # async def broadcast_event(
    #     self,
    #     event: dict,
    # ):
    #     """
    #     Route an event to the appropriate scoped
    #     connections.

    #     Customer-facing streams are user-scoped.
    #     """

    #     # -------------------------------------------------
    #     # USER-SCOPED STREAM
    #     # -------------------------------------------------

    #     user_id = event.get("user_id")

    #     if user_id:
    #         await self.send_to_user(
    #             str(user_id),
    #             event,
    #         )


    async def broadcast_event(
    self,
    event: dict,
):
        print(
        "[WS] Broadcasting event:",
        event,
    )

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

        token = event.get("token")

        if token:
            await self.send(
            str(token),
            event,
            "token",
        )

        provider = event.get("provider")

        if provider:
            await self.send(
            str(provider),
            event,
            "provider",
        )

        route = event.get("route")

        if route:
            await self.send(
            str(route),
            event,
            "route",
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
            "users": len(
                self.user_connections
            ),

            "tokens": len(
                self.token_connections
            ),

            "providers": len(
                self.provider_connections
            ),

            "routes": len(
                self.route_connections
            ),

            "total_connections": (
                sum(
                    len(v)
                    for v in self.user_connections.values()
                )
                + sum(
                    len(v)
                    for v in self.token_connections.values()
                )
                + sum(
                    len(v)
                    for v in self.provider_connections.values()
                )
                + sum(
                    len(v)
                    for v in self.route_connections.values()
                )
            ),
        }


manager = ConnectionManager()