# from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Response
# from fastapi.middleware.cors import CORSMiddleware
# from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
# from threading import Thread
# from starlette.middleware.sessions import SessionMiddleware
# import os

# from .database import Base, engine

# # Routers
# from .health import router as health_router
# from .routes import router as relay_router
# from .replay import router as replay_router
# from .events import router as events_router
# from .delivery_targets import router as delivery_targets_router
# from .route_management import router as routes_management_router
# from .replay_jobs import router as replay_jobs_router
# from .dashboard import router as dashboard_router
# from .auth import (
#     router as auth_router,
#     get_current_user_from_token,
# )
# from .aggregation import router as aggregation_router
# from .usage import router as usage_router
# from .integrations import router as integrations_router
# from .tunnels import router as tunnels_router
# from .auth import (
#     router as auth_router,
#     get_current_user,
# )

# # Dev Mode
# from services.tunnels.tunnel_gateway import (
#     router as tunnel_gateway_router,
# )

# from services.tunnels.tunnel_proxy import (
#     router as tunnel_proxy_router,
# )

# # WebSocket
# from .ws import manager
# from .subscriber import start_redis_subscriber

# from . import metrics

# app = FastAPI(title="Hooktrace API")

# # -----------------------------
# # Background subscriber
# # -----------------------------

# Thread(
#     target=start_redis_subscriber,
#     args=(manager,),
#     daemon=True,
# ).start()

# # -----------------------------
# # Middleware
# # -----------------------------

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.add_middleware(
#     SessionMiddleware,
#     secret_key=os.getenv("JWT_SECRET", "dev-secret"),
# )

# # -----------------------------
# # Database
# # -----------------------------

# Base.metadata.create_all(bind=engine)

# # -----------------------------
# # Routers
# # -----------------------------

# app.include_router(auth_router)
# app.include_router(routes_management_router)
# app.include_router(health_router)
# app.include_router(relay_router)
# app.include_router(replay_router)
# app.include_router(events_router)
# app.include_router(usage_router)
# app.include_router(delivery_targets_router)
# app.include_router(replay_jobs_router)
# app.include_router(tunnels_router)
# app.include_router(aggregation_router)
# app.include_router(integrations_router)
# app.include_router(tunnel_gateway_router)
# app.include_router(tunnel_proxy_router)
# app.include_router(dashboard_router)



# # -----------------------------
# # WebSocket Endpoints
# # -----------------------------

# # @app.websocket("/ws/events")
# # async def ws_global(websocket: WebSocket):
# #     await manager.connect(websocket, "", "global")

# #     try:
# #         while True:
# #             await websocket.receive_text()

# #     except WebSocketDisconnect:
# #         manager.disconnect(websocket, "", "global")


# # @app.websocket("/ws/{token}")
# # async def ws_token(websocket: WebSocket, token: str):
# #     await manager.connect(websocket, token, "token")

# #     try:
# #         while True:
# #             await websocket.receive_text()

# #     except WebSocketDisconnect:
# #         manager.disconnect(websocket, token, "token")


# # @app.websocket("/ws/user/{user_id}")
# # async def ws_user(websocket: WebSocket, user_id: str):
# #     await manager.connect(websocket, user_id, "user")

# #     try:
# #         while True:
# #             await websocket.receive_text()

# #     except WebSocketDisconnect:
# #         manager.disconnect(websocket, user_id, "user")


# # @app.websocket("/ws/provider/{provider}")
# # async def ws_provider(websocket: WebSocket, provider: str):
# #     await manager.connect(websocket, provider, "provider")

# #     try:
# #         while True:
# #             await websocket.receive_text()

# #     except WebSocketDisconnect:
# #         manager.disconnect(websocket, provider, "provider")


# # @app.websocket("/ws/route/{route}")
# # async def ws_route(websocket: WebSocket, route: str):
# #     await manager.connect(websocket, route, "route")

# #     try:
# #         while True:
# #             await websocket.receive_text()

# #     except WebSocketDisconnect:
# #         manager.disconnect(websocket, route, "route")





# # -----------------------------
# # WebSocket Endpoints
# # -----------------------------

# @app.websocket("/ws/stream")
# async def ws_stream(websocket: WebSocket):
#     """
#     Authenticated user-scoped event stream.

#     The user ID is taken from the JWT cookie.
#     The client cannot choose which user to subscribe to.
#     """

#     try:
#         user_id = get_current_user(
#             access_token=websocket.cookies.get(
#                 "access_token"
#             ),
#             authorization=websocket.headers.get(
#                 "authorization"
#             ),
#         )

#     except Exception:
#         await websocket.close(
#             code=1008,
#             reason="Not authenticated",
#         )
#         return

#     user_id = str(user_id)

#     await manager.connect(
#         websocket,
#         user_id,
#         "user",
#     )

#     try:
#         while True:
#             await websocket.receive_text()

#     except WebSocketDisconnect:
#         manager.disconnect(
#             websocket,
#             user_id,
#             "user",
#         )

#     except Exception:
#         manager.disconnect(
#             websocket,
#             user_id,
#             "user",
#         )
# # -----------------------------
# # Metrics
# # -----------------------------

# @app.get("/metrics")
# def metrics_endpoint():
#     return Response(
#         generate_latest(),
#         media_type=CONTENT_TYPE_LATEST,
#     )

# from .metrics_dashboard import (
#     router as metrics_dashboard_router,
# )

# app.include_router(metrics_dashboard_router)

# from .metrics import webhooks_received

# @app.get("/test-metric")
# def test_metric():
#     webhooks_received.labels(
#         provider="stripe",
#         route="test",
#     ).inc()

#     return {"ok": True}






from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
    Response,
    HTTPException,
)
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import (
    generate_latest,
    CONTENT_TYPE_LATEST,
)
from threading import Thread
from starlette.middleware.sessions import SessionMiddleware
import os

from .database import Base, engine

# Routers
from .health import router as health_router
from .routes import router as relay_router
from .replay import router as replay_router
from .events import router as events_router
from .delivery_targets import router as delivery_targets_router
from .route_management import (
    router as routes_management_router,
)
from .replay_jobs import router as replay_jobs_router
from .dashboard import router as dashboard_router
from .auth import (
    router as auth_router,
    get_current_user_from_token,
)
from .aggregation import router as aggregation_router
from .usage import router as usage_router
from .integrations import router as integrations_router
from .tunnels import router as tunnels_router

# Dev Mode
from services.tunnels.tunnel_gateway import (
    router as tunnel_gateway_router,
)

from services.tunnels.tunnel_proxy import (
    router as tunnel_proxy_router,
)

# WebSocket
from .ws import manager
from .subscriber import start_redis_subscriber

from . import metrics


app = FastAPI(
    title="Hooktrace API"
)


# -------------------------------------------------
# Background Redis subscriber
# -------------------------------------------------

Thread(
    target=start_redis_subscriber,
    args=(manager,),
    daemon=True,
).start()


# -------------------------------------------------
# Middleware
# -------------------------------------------------

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
    secret_key=os.getenv(
        "JWT_SECRET",
        "dev-secret",
    ),
)


# -------------------------------------------------
# Database
# -------------------------------------------------

Base.metadata.create_all(
    bind=engine
)


# -------------------------------------------------
# API Routers
# -------------------------------------------------

app.include_router(
    auth_router
)

app.include_router(
    routes_management_router
)

app.include_router(
    health_router
)

app.include_router(
    relay_router
)

app.include_router(
    replay_router
)

app.include_router(
    events_router
)

app.include_router(
    usage_router
)

app.include_router(
    delivery_targets_router
)

app.include_router(
    replay_jobs_router
)

app.include_router(
    tunnels_router
)

app.include_router(
    aggregation_router
)

app.include_router(
    integrations_router
)

app.include_router(
    tunnel_gateway_router
)

app.include_router(
    tunnel_proxy_router
)

app.include_router(
    dashboard_router
)


# -------------------------------------------------
# Authenticated WebSocket Stream
# -------------------------------------------------

@app.websocket("/ws/stream")
async def ws_stream(
    websocket: WebSocket,
):
    """
    Authenticated user-scoped realtime stream.

    The browser does NOT provide a user ID.

    The user is determined from the access_token
    HTTP-only cookie that was created during login.
    """

    access_token = websocket.cookies.get(
        "access_token"
    )

    try:
        user_id = get_current_user_from_token(
            access_token
        )

    except HTTPException:
        await websocket.close(
            code=1008,
            reason="Not authenticated",
        )
        return

    except Exception:
        await websocket.close(
            code=1008,
            reason="Not authenticated",
        )
        return

    user_id = str(user_id)

    # Register this socket under the authenticated
    # user's ID.
    await manager.connect(
        websocket,
        user_id,
        "user",
    )

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(
            websocket,
            user_id,
            "user",
        )

    except Exception:
        manager.disconnect(
            websocket,
            user_id,
            "user",
        )


# -------------------------------------------------
# Metrics
# -------------------------------------------------

@app.get("/metrics")
def metrics_endpoint():
    return Response(
        generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )


# -------------------------------------------------
# Metrics Dashboard
# -------------------------------------------------

from .metrics_dashboard import (
    router as metrics_dashboard_router,
)

app.include_router(
    metrics_dashboard_router
)


# -------------------------------------------------
# Test Metric
# -------------------------------------------------

from .metrics import webhooks_received


@app.get("/test-metric")
def test_metric():
    webhooks_received.labels(
        provider="stripe",
        route="test",
    ).inc()

    return {
        "ok": True
    }