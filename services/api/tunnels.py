
"""
Dev Mode Tunnels API
Manages local development tunnels
"""

from datetime import datetime
from typing import Optional
import uuid
import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text

from .database import SessionLocal
from .auth import get_current_user


router = APIRouter(prefix="/tunnels", tags=["tunnels"])


# -----------------------------
# Schemas
# -----------------------------

class CreateTunnelRequest(BaseModel):
    name: str
    local_url: str


class UpdateTunnelRequest(BaseModel):
    name: Optional[str] = None
    local_url: Optional[str] = None
    status: Optional[str] = None


# -----------------------------
# Endpoints
# -----------------------------

@router.get("")
def list_tunnels(user_id: str = Depends(get_current_user)):
    """List all tunnels for current user"""
    db = SessionLocal()
    try:
        tunnels = db.execute(
            text("""
                SELECT 
                    id, name, local_url, public_url, token, status,
                    created_at, last_used, request_count
                FROM dev_tunnels
                WHERE user_id = :user_id
                ORDER BY created_at DESC
            """),
            {"user_id": user_id}
        ).fetchall()

        return {
            "items": [
                {
                    "id": str(row[0]),
                    "name": row[1],
                    "localUrl": row[2],
                    "publicUrl": row[3],
                    "token": row[4],
                    "status": row[5],
                    "createdAt": row[5].isoformat() if row[5] else None,
                    "lastUsed": row[6].isoformat() if row[6] else None,
                    "requestCount": row[7],
                }
                for row in tunnels
            ]
        }
    finally:
        db.close()


@router.post("")
def create_tunnel(
    request: CreateTunnelRequest,
    user_id: str = Depends(get_current_user)
):
    """Create a new dev tunnel"""
    db = SessionLocal()
    try:
        tunnel_id = str(uuid.uuid4())

        token = secrets.token_urlsafe(16)
        public_url = f"https://hook-{token}.hooktrace.dev"

        db.execute(
            text("""
                INSERT INTO dev_tunnels 
                (id, user_id, name, local_url, public_url, token, status)
                VALUES (:id, :user_id, :name, :local_url, :public_url, :token, 'active')
            """),
            {
                "id": tunnel_id,
                "user_id": user_id,
                "name": request.name,
                "local_url": request.local_url,
                "public_url": public_url,
                "token": token,
            }
        )
        db.commit()

        return {
            "id": tunnel_id,
            "name": request.name,
            "localUrl": request.local_url,
            "publicUrl": public_url,
            "token": token,
            "status": "active",
            "createdAt": datetime.utcnow().isoformat(),
            "lastUsed": None,
            "requestCount": 0,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@router.get("/{tunnel_id}")
def get_tunnel(
    tunnel_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get a specific tunnel"""
    db = SessionLocal()
    try:
        tunnel = db.execute(
            text("""
                SELECT 
                    id, name, local_url, public_url, token, status,
                    created_at, last_used, request_count
                FROM dev_tunnels
                WHERE id = :id AND user_id = :user_id
            """),
            {"id": tunnel_id, "user_id": user_id}
        ).fetchone()

        if not tunnel:
            raise HTTPException(status_code=404, detail="Tunnel not found")

        return {
            "id": str(tunnel[0]),
            "name": tunnel[1],
            "localUrl": tunnel[2],
            "publicUrl": tunnel[3],
            "token": tunnel[4],
            "status": tunnel[5],
            "createdAt": tunnel[5].isoformat() if tunnel[5] else None,
            "lastUsed": tunnel[6].isoformat() if tunnel[6] else None,
            "requestCount": tunnel[7],
        }
    finally:
        db.close()


@router.patch("/{tunnel_id}")
def update_tunnel(
    tunnel_id: str,
    request: UpdateTunnelRequest,
    user_id: str = Depends(get_current_user)
):
    """Update a tunnel"""
    db = SessionLocal()
    try:
        existing = db.execute(
            text("SELECT id FROM dev_tunnels WHERE id = :id AND user_id = :user_id"),
            {"id": tunnel_id, "user_id": user_id}
        ).fetchone()

        if not existing:
            raise HTTPException(status_code=404, detail="Tunnel not found")

        updates = []
        params = {"id": tunnel_id, "user_id": user_id}

        if request.name is not None:
            updates.append("name = :name")
            params["name"] = request.name

        if request.local_url is not None:
            updates.append("local_url = :local_url")
            params["local_url"] = request.local_url

        if request.status is not None:
            updates.append("status = :status")
            params["status"] = request.status

        if updates:
            query = f"""
                UPDATE dev_tunnels
                SET {', '.join(updates)}
                WHERE id = :id AND user_id = :user_id
            """
            db.execute(text(query), params)
            db.commit()

        return get_tunnel(tunnel_id, user_id)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@router.delete("/{tunnel_id}")
def delete_tunnel(
    tunnel_id: str,
    user_id: str = Depends(get_current_user)
):
    """Delete a tunnel"""
    db = SessionLocal()
    try:
        result = db.execute(
            text("DELETE FROM dev_tunnels WHERE id = :id AND user_id = :user_id"),
            {"id": tunnel_id, "user_id": user_id}
        )
        db.commit()

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Tunnel not found")

        return {"success": True}
    finally:
        db.close()


@router.get("/{tunnel_id}/logs")
def get_tunnel_logs(
    tunnel_id: str,
    limit: int = 50,
    user_id: str = Depends(get_current_user)
):
    """Get logs for a tunnel"""
    db = SessionLocal()
    try:
        tunnel = db.execute(
            text("SELECT id FROM dev_tunnels WHERE id = :id AND user_id = :user_id"),
            {"id": tunnel_id, "user_id": user_id}
        ).fetchone()

        if not tunnel:
            raise HTTPException(status_code=404, detail="Tunnel not found")

        logs = db.execute(
            text("""
                SELECT 
                    id, method, path, status_code, duration_ms,
                    provider, event_type, request_headers, request_body,
                    response_status, response_body, error, created_at
                FROM tunnel_logs
                WHERE tunnel_id = :tunnel_id
                ORDER BY created_at DESC
                LIMIT :limit
            """),
            {"tunnel_id": tunnel_id, "limit": limit}
        ).fetchall()

        return {
            "items": [
                {
                    "id": str(row[0]),
                    "method": row[1],
                    "path": row[2],
                    "statusCode": row[3],
                    "duration": row[4],
                    "provider": row[5],
                    "event": row[6],
                    "requestHeaders": row[7],
                    "requestBody": row[8],
                    "responseStatus": row[9],
                    "responseBody": row[10],
                    "error": row[11],
                    "timestamp": row[12].isoformat() if row[12] else None,
                }
                for row in logs
            ]
        }
    finally:
        db.close()


@router.get("/{tunnel_id}/stats")
def get_tunnel_stats(
    tunnel_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get statistics for a tunnel"""
    db = SessionLocal()
    try:
        tunnel = db.execute(
            text("SELECT id FROM dev_tunnels WHERE id = :id AND user_id = :user_id"),
            {"id": tunnel_id, "user_id": user_id}
        ).fetchone()

        if not tunnel:
            raise HTTPException(status_code=404, detail="Tunnel not found")

        stats = db.execute(
            text("""
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as success,
                    COUNT(CASE WHEN status_code >= 400 OR error IS NOT NULL THEN 1 END) as errors,
                    AVG(duration_ms) as avg_duration
                FROM tunnel_logs
                WHERE tunnel_id = :tunnel_id
            """),
            {"tunnel_id": tunnel_id}
        ).fetchone()

        if not stats:
            return {
                "total": 0,
                "success": 0,
                "errors": 0,
                "avgDuration": 0
            }

        return {
            "total": stats[0] or 0,
            "success": stats[1] or 0,
            "errors": stats[2] or 0,
            "avgDuration": int(stats[3]) if stats[3] else 0
        }
    finally:
        db.close()

