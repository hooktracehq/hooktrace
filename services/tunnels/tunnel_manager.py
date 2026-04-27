"""
Dev Mode Tunnel Manager
Forwards webhooks to local development servers
Integrates with services/cli/listen.py
"""

from typing import Dict, Any
from datetime import datetime
import httpx
from sqlalchemy import text
from services.api.ws import manager
from ..api.database import SessionLocal


class TunnelManager:
    """Manages dev mode tunnels and request forwarding"""

    async def forward_to_tunnels(
        self,
        user_id: str,
        provider: str,
        payload: Dict[str, Any],
        headers: Dict[str, str],
    ) -> Dict[str, Any]:

        db = SessionLocal()

        try:
            
            tunnels = db.execute(
                text("""
                    SELECT id, local_url, public_url, token
                    FROM dev_tunnels
                    WHERE user_id = :user_id AND status = 'active'
                """),
                {"user_id": user_id},
            ).fetchall()

            if not tunnels:
                return {"forwarded": 0, "tunnels": []}

            results = []

            for tunnel in tunnels:
                tunnel_id = str(tunnel[0])
                local_url = tunnel[1]
                public_url = tunnel[2]
                token = tunnel[3]  

                start_time = datetime.utcnow()

                #  WebSocket (CLI streaming)
                if token:
                    await manager.send_to_token(
                        token=token,
                        data={
                            "payload": payload,
                            "headers": headers,
                            "provider": provider,
                        },
                    )

                try:
                    #  Forward to local dev server
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.post(
                            f"{local_url}/webhook/{provider}",
                            json=payload,
                            headers=headers,
                        )

                    duration_ms = int(
                        (datetime.utcnow() - start_time).total_seconds() * 1000
                    )

                    #  Log success
                    self._log_tunnel_request(
                        db,
                        tunnel_id=tunnel_id,
                        method="POST",
                        path=f"/webhook/{provider}",
                        status_code=response.status_code,
                        duration_ms=duration_ms,
                        provider=provider,
                        request_headers=headers,
                        request_body=payload,
                        response_status=response.status_code,
                        response_body=(
                            response.json()
                            if response.headers.get("content-type", "").startswith("application/json")
                            else None
                        ),
                    )

                    #  Update stats
                    db.execute(
                        text("""
                            UPDATE dev_tunnels
                            SET request_count = request_count + 1,
                                last_used = CURRENT_TIMESTAMP
                            WHERE id = :id
                        """),
                        {"id": tunnel_id},
                    )

                    results.append({
                        "tunnel_id": tunnel_id,
                        "local_url": local_url,
                        "success": True,
                        "status_code": response.status_code,
                        "duration_ms": duration_ms,
                    })

                except Exception as e:
                    duration_ms = int(
                        (datetime.utcnow() - start_time).total_seconds() * 1000
                    )

                    #  Log failure
                    self._log_tunnel_request(
                        db,
                        tunnel_id=tunnel_id,
                        method="POST",
                        path=f"/webhook/{provider}",
                        status_code=0,
                        duration_ms=duration_ms,
                        provider=provider,
                        request_headers=headers,
                        request_body=payload,
                        error=str(e),
                    )

                    results.append({
                        "tunnel_id": tunnel_id,
                        "local_url": local_url,
                        "success": False,
                        "error": str(e),
                        "duration_ms": duration_ms,
                    })

            db.commit()

            return {
                "forwarded": len([r for r in results if r["success"]]),
                "failed": len([r for r in results if not r["success"]]),
                "tunnels": results,
            }

        except Exception as e:
            print(f"Error forwarding to tunnels: {e}")
            return {"forwarded": 0, "failed": 0, "error": str(e)}

        finally:
            db.close()

    def _log_tunnel_request(
        self,
        db,
        tunnel_id: str,
        method: str,
        path: str,
        status_code: int,
        duration_ms: int,
        provider: str = None,
        request_headers: Dict = None,
        request_body: Dict = None,
        response_status: int = None,
        response_body: Dict = None,
        error: str = None,
    ):
        try:
            db.execute(
                text("""
                    INSERT INTO tunnel_logs (
                        tunnel_id, method, path, status_code, duration_ms,
                        provider, request_headers, request_body,
                        response_status, response_body, error
                    ) VALUES (
                        :tunnel_id, :method, :path, :status_code, :duration_ms,
                        :provider, :request_headers, :request_body,
                        :response_status, :response_body, :error
                    )
                """),
                {
                    "tunnel_id": tunnel_id,
                    "method": method,
                    "path": path,
                    "status_code": status_code,
                    "duration_ms": duration_ms,
                    "provider": provider,
                    "request_headers": request_headers,
                    "request_body": request_body,
                    "response_status": response_status,
                    "response_body": response_body,
                    "error": error,
                },
            )
        except Exception as e:
            print(f"Error logging tunnel request: {e}")


# Global instance
tunnel_manager = TunnelManager()


async def forward_to_tunnels(
    user_id: str,
    provider: str,
    payload: Dict[str, Any],
    headers: Dict[str, str],
):
    return await tunnel_manager.forward_to_tunnels(
        user_id, provider, payload, headers
    )