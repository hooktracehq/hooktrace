from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:

    def __init__(self):
        self.connections: Dict[str, List[WebSocket]] = {}
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, token: str):
        await websocket.accept()

        if token not in self.connections:
            self.connections[token] = []

        self.connections[token].append(websocket)
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, token: str):
        if token in self.connections:
            if websocket in self.connections[token]:
                self.connections[token].remove(websocket)

        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

    async def send_to_token(self, token: str, data):
        for ws in self.connections.get(token, []):
            await ws.send_json(data)



manager = ConnectionManager()