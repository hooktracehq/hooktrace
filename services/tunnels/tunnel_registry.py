# import time
# from typing import Dict
# from fastapi import WebSocket


# class TunnelRegistry:

#     def __init__(self):
#         self.connections: Dict[str, WebSocket] = {}
#         self.metadata: Dict[str, dict] = {}

#     async def register(
#         self,
#         token: str,
#         websocket: WebSocket,
#     ):
#         self.connections[token] = websocket

#         self.metadata[token] = {
#             "connected_at": time.time(),
#             "last_heartbeat": time.time(),
#             "status": "connected",
#         }

#     def unregister(self, token: str):
#         self.connections.pop(token, None)
#         self.metadata.pop(token, None)

#     def exists(self, token: str):
#         return token in self.connections

#     def get_socket(self, token: str):
#         return self.connections.get(token)

#     def heartbeat(self, token: str):
#         if token in self.metadata:
#             self.metadata[token]["last_heartbeat"] = time.time()

#     def is_alive(self, token: str, timeout: int = 30):
#         meta = self.metadata.get(token)

#         if not meta:
#             return False

#         return (
#             time.time() - meta["last_heartbeat"]
#         ) < timeout


# registry = TunnelRegistry()