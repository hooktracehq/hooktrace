# """
# Dev Tunnel Ingress

# Receives incoming requests for local development tunnels.

# Flow

# HTTP
#     │
#     ▼
# Lookup tunnel
#     │
#     ▼
# Create tunnel_logs entry
#     │
#     ▼
# Publish to Redis
#     │
#     ▼
# CLI
# """

# import json
# import uuid
# from datetime import datetime

# from fastapi import APIRouter
# from fastapi import HTTPException
# from fastapi import Request
# from fastapi.responses import JSONResponse
# from sqlalchemy import text

# from .database import SessionLocal

# from services.shared.redis_client import redis_client

# router = APIRouter(tags=["Dev Tunnels"])


# @router.api_route(
#     "/tunnel/{token}",
#     methods=[
#         "GET",
#         "POST",
#         "PUT",
#         "PATCH",
#         "DELETE",
#     ],
# )
# async def tunnel_ingress(
#     token: str,
#     request: Request,
# ):
#     db = SessionLocal()

#     try:
#         tunnel = db.execute(
#             text(
#                 """
#                 SELECT
#                     id,
#                     name,
#                     local_url,
#                     status
#                 FROM dev_tunnels
#                 WHERE token = :token
#                 """
#             ),
#             {
#                 "token": token,
#             },
#         ).mappings().first()

#         if not tunnel:
#             raise HTTPException(
#                 status_code=404,
#                 detail="Tunnel not found",
#             )

#         if tunnel["status"] != "active":
#             raise HTTPException(
#                 status_code=409,
#                 detail="Tunnel is paused",
#             )

#         # --------------------------------------------------
#         # Request
#         # --------------------------------------------------

#         raw_body = await request.body()

#         try:
#             parsed_body = json.loads(
#                 raw_body.decode()
#             )
#         except Exception:
#             parsed_body = None

#         body_text = raw_body.decode(
#             errors="ignore",
#         )

#         headers = dict(request.headers)

#         log_id = uuid.uuid4()

#         path = str(request.url.path)

#         # --------------------------------------------------
#         # Save log
#         # --------------------------------------------------

#         db.execute(
#             text(
#                 """
#                 INSERT INTO tunnel_logs
#                 (
#                     id,
#                     tunnel_id,
#                     method,
#                     path,
#                     request_headers,
#                     request_body,
#                     created_at
#                 )
#                 VALUES
#                 (
#                     :id,
#                     :tunnel_id,
#                     :method,
#                     :path,
#                     CAST(:headers AS jsonb),
#                     :body,
#                     NOW()
#                 )
#                 """
#             ),
#             {
#                 "id": log_id,
#                 "tunnel_id": tunnel["id"],
#                 "method": request.method,
#                 "path": path,
#                 "headers": json.dumps(headers),
#                 "body": body_text,
#             },
#         )

#         db.execute(
#             text(
#                 """
#                 UPDATE dev_tunnels
#                 SET
#                     request_count = request_count + 1,
#                     last_used = NOW()
#                 WHERE id = :id
#                 """
#             ),
#             {
#                 "id": tunnel["id"],
#             },
#         )

#         db.commit()

#         # --------------------------------------------------
#         # Publish to Redis
#         # --------------------------------------------------

#         redis_client.publish(
#             f"tunnel:{token}",
#             json.dumps(
#                 {
#                     "type": "tunnel.request",
#                     "log_id": str(log_id),
#                     "tunnel_id": str(
#                         tunnel["id"]
#                     ),
#                     "token": token,
#                     "method": request.method,
#                     "path": path,
#                     "headers": headers,
#                     "body": body_text,
#                     "json": parsed_body,
#                     "timestamp": datetime.utcnow().isoformat(),
#                 }
#             ),
#         )

#         return JSONResponse(
#             status_code=202,
#             content={
#                 "accepted": True,
#                 "logId": str(log_id),
#                 "message": "Request forwarded to tunnel.",
#             },
#         )

#     finally:
#         db.close()