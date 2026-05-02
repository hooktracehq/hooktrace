# from fastapi import WebSocket
# from typing import Dict, List


# class ConnectionManager:

#     def __init__(self):
#         self.connections: Dict[str, List[WebSocket]] = {}
#         self.active_connections: List[WebSocket] = []

#     async def connect(self, websocket: WebSocket, token: str):
#         await websocket.accept()

#         if token not in self.connections:
#             self.connections[token] = []

#         self.connections[token].append(websocket)
#         self.active_connections.append(websocket)

#     def disconnect(self, websocket: WebSocket, token: str):
#         if token in self.connections:
#             if websocket in self.connections[token]:
#                 self.connections[token].remove(websocket)

#         if websocket in self.active_connections:
#             self.active_connections.remove(websocket)

#     async def broadcast(self, message: str):
#         for connection in self.active_connections:
#             try:
#                 await connection.send_text(message)
#             except:
#                 pass

#     async def send_to_token(self, token: str, data):
#         for ws in self.connections.get(token, []):
#             await ws.send_json(data)



# manager = ConnectionManager()





from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        self.token_connections: Dict[str, List[WebSocket]] = {}
        self.user_connections: Dict[str, List[WebSocket]] = {}
        self.provider_connections: Dict[str, List[WebSocket]] = {}
        self.route_connections: Dict[str, List[WebSocket]] = {}

    # -------------------------
    # CONNECT
    # -------------------------
    async def connect(self, websocket: WebSocket, key: str, type_: str):
        await websocket.accept()

        target = self._get_bucket(type_)

        if key not in target:
            target[key] = []

        target[key].append(websocket)

    def disconnect(self, websocket: WebSocket, key: str, type_: str):
        target = self._get_bucket(type_)

        if key in target and websocket in target[key]:
            target[key].remove(websocket)

    def _get_bucket(self, type_: str):
        return {
            "token": self.token_connections,
            "user": self.user_connections,
            "provider": self.provider_connections,
            "route": self.route_connections,
        }[type_]

    # -------------------------
    # SEND
    # -------------------------
    async def send(self, key: str, data, type_: str):
        target = self._get_bucket(type_)

        for ws in target.get(key, []):
            try:
                await ws.send_json(data)
            except:
                pass

    # -------------------------
    # BROADCAST (SMART)
    # -------------------------
    async def broadcast_event(self, event: dict):
        # token (if exists)
        token = event.get("token")
        if token:
            await self.send(token, event, "token")

        # user
        user_id = event.get("user_id")
        if user_id:
            await self.send(str(user_id), event, "user")

        # provider
        provider = event.get("provider")
        if provider:
            await self.send(provider, event, "provider")

        # route
        route = event.get("route")
        if route:
            await self.send(route, event, "route")


manager = ConnectionManager()