# import asyncio
# import json
# import uuid

# from fastapi import APIRouter
# from fastapi import HTTPException
# from fastapi import Request
# from fastapi.responses import Response

# from services.api.ws import manager


# router = APIRouter(tags=["tunnel-proxy"])


# from services.tunnels.pending_requests import PENDING_RESPONSES


# @router.api_route(
#     "/proxy/{token}/{path:path}",
#     methods=[
#         "GET",
#         "POST",
#         "PUT",
#         "PATCH",
#         "DELETE",
#         "OPTIONS",
#     ],
# )
# async def proxy_request(
#     request: Request,
#     token: str,
#     path: str,
# ):
#     connections = manager.token_connections.get(token)

#     if not connections:
#         raise HTTPException(
#             status_code=404,
#             detail="Tunnel offline",
#         )

#     websocket = connections[0]

#     body = await request.body()

#     request_id = str(uuid.uuid4())

#     future = asyncio.get_running_loop().create_future()

#     PENDING_RESPONSES[request_id] = future

#     payload = {
#         "type": "request",
#         "request_id": request_id,
#         "method": request.method,
#         "path": "/" + path,
#         "query": str(request.url.query),
#         "headers": dict(request.headers),
#         "body": body.decode(errors="ignore"),
#     }

#     try:
#         await websocket.send_text(
#             json.dumps(payload)
#         )

#         result = await asyncio.wait_for(
#             future,
#             timeout=30,
#         )

#     except asyncio.TimeoutError:

#         PENDING_RESPONSES.pop(
#             request_id,
#             None,
#         )

#         raise HTTPException(
#             status_code=504,
#             detail="Tunnel response timeout",
#         )

#     except Exception as e:

#         PENDING_RESPONSES.pop(
#             request_id,
#             None,
#         )

#         raise HTTPException(
#             status_code=500,
#             detail=str(e),
#         )

#     return Response(
#         content=result.get("body", ""),
#         status_code=result.get(
#             "status_code",
#             200,
#         ),
#         headers=result.get("headers") or {},
#     )






import asyncio
import json
import time
import uuid

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from sqlalchemy import text
from psycopg2.extras import Json

from services.api.database import SessionLocal
from services.api.ws import manager
from services.tunnels.pending_requests import PENDING_RESPONSES

router = APIRouter(tags=["tunnel-proxy"])


@router.api_route(
    "/proxy/{token}/{path:path}",
    methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
)
async def proxy_request(
    request: Request,
    token: str,
    path: str,
):
    connections = manager.token_connections.get(token)

    if not connections:
        raise HTTPException(
            status_code=404,
            detail="Tunnel offline",
        )

    websocket = connections[0]

    db = SessionLocal()

    tunnel = db.execute(
        text("""
            SELECT id
            FROM dev_tunnels
            WHERE token = :token
        """),
        {"token": token},
    ).fetchone()

    if not tunnel:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Tunnel not found",
        )

    tunnel_id = str(tunnel[0])

    body = await request.body()

    request_id = str(uuid.uuid4())

    future = asyncio.get_running_loop().create_future()

    PENDING_RESPONSES[request_id] = future

    payload = {
        "type": "request",
        "request_id": request_id,
        "method": request.method,
        "path": "/" + path,
        "query": str(request.url.query),
        "headers": dict(request.headers),
        "body": body.decode(errors="ignore"),
    }

    start = time.perf_counter()

    try:

        await websocket.send_text(
            json.dumps(payload)
        )

        result = await asyncio.wait_for(
            future,
            timeout=30,
        )

        duration = int(
            (time.perf_counter() - start) * 1000
        )

        db.execute(
            text("""
                INSERT INTO tunnel_logs (
                    tunnel_id,
                    method,
                    path,
                    status_code,
                    duration_ms,
                    request_headers,
                    request_body,
                    response_status,
                    response_body
                )
                VALUES (
                    :tunnel_id,
                    :method,
                    :path,
                    :status_code,
                    :duration_ms,
                    :request_headers,
                    :request_body,
                    :response_status,
                    :response_body
                )
            """),
            {
                "tunnel_id": tunnel_id,
                "method": request.method,
                "path": "/" + path,
                "status_code": result.get("status_code"),
                "duration_ms": duration,
                "request_headers": Json(dict(request.headers)),
                "request_body": body.decode(errors="ignore"),
                "response_status": result.get("status_code"),
                "response_body": result.get("body"),
            },
        )

        db.execute(
            text("""
                UPDATE dev_tunnels
                SET
                    request_count = request_count + 1,
                    last_used = NOW()
                WHERE id = :id
            """),
            {"id": tunnel_id},
        )

        db.commit()

    except asyncio.TimeoutError:

        PENDING_RESPONSES.pop(
            request_id,
            None,
        )

        db.rollback()

        raise HTTPException(
            status_code=504,
            detail="Tunnel response timeout",
        )

    except Exception as e:

        PENDING_RESPONSES.pop(
            request_id,
            None,
        )

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:
        db.close()

    return Response(
        content=result.get("body", ""),
        status_code=result.get(
            "status_code",
            200,
        ),
        headers=result.get("headers") or {},
    )