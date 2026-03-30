# services/tunnels/tunnel_manager.py
"""
Dev Mode Tunnel Manager
Forwards webhooks to local development servers
Integrates with services/cli/listen.py
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import httpx
from sqlalchemy import text

from database import SessionLocal


# -----------------------------
# Database Setup
# -----------------------------

CREATE_TUNNELS_TABLE = """
CREATE TABLE IF NOT EXISTS dev_tunnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    local_url VARCHAR(512) NOT NULL,
    public_url VARCHAR(512) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    request_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tunnel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tunnel_id UUID NOT NULL REFERENCES dev_tunnels(id) ON DELETE CASCADE,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(512) NOT NULL,
    status_code INTEGER,
    duration_ms INTEGER,
    provider VARCHAR(50),
    event_type VARCHAR(255),
    request_headers JSONB,
    request_body JSONB,
    response_status INTEGER,
    response_body JSONB,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tunnel_logs_tunnel_id ON tunnel_logs(tunnel_id);
CREATE INDEX idx_tunnel_logs_created_at ON tunnel_logs(created_at);
"""


class TunnelManager:
    """Manages dev mode tunnels and request forwarding"""
    
    def __init__(self):
        self.active_tunnels: Dict[str, Dict] = {}
    
    async def forward_to_tunnels(
        self,
        user_id: str,
        provider: str,
        payload: Dict[str, Any],
        headers: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Forward webhook to all active tunnels for this user
        
        Args:
            user_id: User ID who owns the tunnels
            provider: Provider name (stripe, github, etc.)
            payload: Webhook payload
            headers: Original webhook headers
        
        Returns:
            Dictionary with forwarding results
        """
        db = SessionLocal()
        
        try:
            # Get active tunnels for user
            tunnels = db.execute(
                text("""
                    SELECT id, local_url, public_url
                    FROM dev_tunnels
                    WHERE user_id = :user_id AND status = 'active'
                """),
                {"user_id": user_id}
            ).fetchall()
            
            if not tunnels:
                return {
                    "forwarded": 0,
                    "tunnels": []
                }
            
            results = []
            
            # Forward to each tunnel
            for tunnel in tunnels:
                tunnel_id = str(tunnel[0])
                local_url = tunnel[1]
                public_url = tunnel[2]
                
                start_time = datetime.utcnow()
                
                try:
                    # Forward request to local URL
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.post(
                            f"{local_url}/webhook/{provider}",
                            json=payload,
                            headers=headers
                        )
                    
                    duration_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                    
                    # Log successful forward
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
                        response_body=response.json() if response.headers.get("content-type", "").startswith("application/json") else None
                    )
                    
                    # Update tunnel stats
                    db.execute(
                        text("""
                            UPDATE dev_tunnels
                            SET request_count = request_count + 1,
                                last_used = CURRENT_TIMESTAMP
                            WHERE id = :id
                        """),
                        {"id": tunnel_id}
                    )
                    
                    results.append({
                        "tunnel_id": tunnel_id,
                        "local_url": local_url,
                        "success": True,
                        "status_code": response.status_code,
                        "duration_ms": duration_ms
                    })
                    
                except Exception as e:
                    duration_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                    
                    # Log failed forward
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
                        error=str(e)
                    )
                    
                    results.append({
                        "tunnel_id": tunnel_id,
                        "local_url": local_url,
                        "success": False,
                        "error": str(e),
                        "duration_ms": duration_ms
                    })
            
            db.commit()
            
            return {
                "forwarded": len([r for r in results if r["success"]]),
                "failed": len([r for r in results if not r["success"]]),
                "tunnels": results
            }
            
        except Exception as e:
            print(f"Error forwarding to tunnels: {e}")
            return {
                "forwarded": 0,
                "failed": 0,
                "error": str(e)
            }
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
        error: str = None
    ):
        """Log tunnel request"""
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
                }
            )
        except Exception as e:
            print(f"Error logging tunnel request: {e}")


# Global instance
tunnel_manager = TunnelManager()


# Helper function
async def forward_to_tunnels(
    user_id: str,
    provider: str,
    payload: Dict[str, Any],
    headers: Dict[str, str]
) -> Dict[str, Any]:
    """
    Convenience function to forward webhook to tunnels
    
    Usage:
        from services.tunnels.tunnel_manager import forward_to_tunnels
        
        result = await forward_to_tunnels(
            user_id="user-123",
            provider="stripe",
            payload={"event": "payment_intent.succeeded", ...},
            headers={"x-stripe-signature": "..."}
        )
    """
    return await tunnel_manager.forward_to_tunnels(user_id, provider, payload, headers)