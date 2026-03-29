from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from threading import Thread
from starlette.middleware.sessions import SessionMiddleware
import os

from database import Base, engine
from health import router as health_router
from routes import router as relay_router
from replay import router as replay_router
from events import router as events_router
from api.delivery_targets import router as delivery_targets_router
from route_management import router as routes_management_router
from auth import router as auth_router
from ws import ConnectionManager
from subscriber import start_redis_subscriber
from usage import router as usage_router
import metrics

# -----------------------------
# App Init
# -----------------------------

app = FastAPI(title="Hooktrace API")

# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("JWT_SECRET", "dev-secret")
)
# -----------------------------
# DB Init
# -----------------------------

Base.metadata.create_all(bind=engine)

# -----------------------------
# Routers
# -----------------------------

app.include_router(auth_router)
app.include_router(routes_management_router)
app.include_router(health_router)
app.include_router(relay_router)
app.include_router(replay_router)
app.include_router(events_router)
app.include_router(usage_router)
app.include_router(delivery_targets_router)

# -----------------------------
# WebSocket
# -----------------------------

manager = ConnectionManager()

@app.on_event("startup")
def start_subscriber():
    Thread(
        target=start_redis_subscriber,
        args=(manager,),
        daemon=True,
    ).start()

@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# -----------------------------
# Metrics
# -----------------------------

@app.get("/metrics")
def metrics_endpoint():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)





tunnels = {}

@app.websocket("/ws/tunnel/{token}")
async def websocket_tunnel(websocket: WebSocket, token: str):
    await websocket.accept()

    tunnels[token] = websocket

    print(f"[tunnel] connected: {token}")

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        print(f"[tunnel] disconnected: {token}")
        tunnels.pop(token, None)