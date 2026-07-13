import asyncio
import json
import uuid

from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Request
from fastapi.responses import Response

from services.api.ws import manager


router = APIRouter(tags=["tunnel-proxy"])


from services.tunnels.pending_requests import PENDING_RESPONSES


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

    try:
        await websocket.send_text(
            json.dumps(payload)
        )

        result = await asyncio.wait_for(
            future,
            timeout=30,
        )

    except asyncio.TimeoutError:

        PENDING_RESPONSES.pop(
            request_id,
            None,
        )

        raise HTTPException(
            status_code=504,
            detail="Tunnel response timeout",
        )

    except Exception as e:

        PENDING_RESPONSES.pop(
            request_id,
            None,
        )

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    return Response(
        content=result.get("body", ""),
        status_code=result.get(
            "status_code",
            200,
        ),
        headers=result.get("headers") or {},
    )