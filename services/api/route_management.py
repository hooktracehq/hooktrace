from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from .database import SessionLocal
from .auth import get_current_user

import secrets


router = APIRouter(
    prefix="/routes",
    tags=["routes"],
)


@router.get("/")
def list_routes(
    user_id: str = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        rows = db.execute(
            text(
                """
                SELECT
                    r.id,
                    r.token,
                    r.route,
                    r.mode,
                    r.dev_target,
                    r.prod_target,
                    r.created_at,
                    r.secret,
                    r.provider,

                    COUNT(e.id) AS throughput,

                    COUNT(e.id) FILTER (
                        WHERE e.status IN (
                            'failed',
                            'dlq'
                        )
                    ) AS failures,

                    MAX(e.created_at) AS last_seen,
                    COUNT(
    DISTINCT rdt.target_id
) AS destinations,

                    'active' AS status

                FROM webhook_routes r

                LEFT JOIN webhook_events e
                    ON e.route_id = r.id

                LEFT JOIN route_delivery_targets rdt
    ON rdt.route_id = r.id
    AND rdt.enabled = TRUE

                WHERE r.user_id = :user_id

                GROUP BY
                    r.id,
                    r.token,
                    r.route,
                    r.mode,
                    r.dev_target,
                    r.prod_target,
                    r.created_at,
                    r.secret,
                    r.provider,
                    r.tunnel_id

                ORDER BY r.created_at DESC
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().all()

        return {
            "items": [
                {
                    "id": str(row["id"]),
                    "token": row["token"],
                    "route": row["route"],
                    "mode": row["mode"],
                    "dev_target": row["dev_target"],
                    "prod_target": row["prod_target"],
                    "created_at": row["created_at"],
                    "secret": row["secret"],
                    "provider": row["provider"] or "generic",
                    "status": row["status"],
                    "throughput": int(
                        row["throughput"] or 0
                    ),
                    "failures": int(
                        row["failures"] or 0
                    ),
                    "last_seen": (
                        row["last_seen"].isoformat()
                        if row["last_seen"]
                        else None
                    ),
                    "destinations": int(
                     row["destinations"] or 0
                    ),
                }
                for row in rows
            ]
        }

    finally:
        db.close()


@router.post("/")
def create_route(
    payload: dict,
    user_id: str = Depends(get_current_user),
):
    route_name = payload.get("route")
    mode = payload.get("mode", "dev")

    dev_target = payload.get(
        "dev_target"
    )

    prod_target = payload.get(
        "prod_target"
    )

    if not route_name:
        raise HTTPException(
            status_code=400,
            detail="Route required",
        )

    if mode not in ["dev", "prod"]:
        raise HTTPException(
            status_code=400,
            detail="Mode must be dev or prod",
        )

    token = secrets.token_hex(8)

    secret = secrets.token_hex(16)

    db = SessionLocal()

    try:
        user = db.execute(
            text(
                """
                SELECT id
                FROM users
                WHERE id = :id
                """
            ),
            {
                "id": user_id,
            },
        ).fetchone()

        if not user:
            raise HTTPException(
                status_code=400,
                detail="User not found",
            )

        # -------------------------------------------------
        # Tunnel is OPTIONAL.
        #
        # If an active tunnel exists, associate it.
        # Otherwise the route still works as a normal
        # production/public webhook endpoint.
        # -------------------------------------------------

        tunnel = db.execute(
            text(
                """
                SELECT id
                FROM dev_tunnels
                WHERE user_id = :user_id
                AND status = 'active'
                ORDER BY created_at DESC
                LIMIT 1
                """
            ),
            {
                "user_id": user_id,
            },
        ).fetchone()

        tunnel_id = (
            tunnel[0]
            if tunnel
            else None
        )

        db.execute(
            text(
                """
                INSERT INTO webhook_routes (
                    token,
                    route,
                    secret,
                    mode,
                    dev_target,
                    prod_target,
                    user_id,
                    tunnel_id
                )

                VALUES (
                    :token,
                    :route,
                    :secret,
                    :mode,
                    :dev_target,
                    :prod_target,
                    :user_id,
                    :tunnel_id
                )
                """
            ),
            {
                "token": token,
                "route": route_name,
                "secret": secret,
                "mode": mode,
                "dev_target": dev_target,
                "prod_target": prod_target,
                "user_id": user_id,
                "tunnel_id": tunnel_id,
            },
        )

        db.commit()

        return {
            "id": None,
            "token": token,
            "route": route_name,
            "mode": mode,
            "dev_target": dev_target,
            "prod_target": prod_target,
            "secret": secret,
            "tunnel_id": tunnel_id,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    finally:
        db.close()



@router.get("/{route_id}/targets")
def list_route_targets(
    route_id: int,
    user_id: str = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        route = db.execute(
            text(
                """
                SELECT id
                FROM webhook_routes
                WHERE id = :route_id
                AND user_id = :user_id
                """
            ),
            {
                "route_id": route_id,
                "user_id": user_id,
            },
        ).fetchone()

        if not route:
            raise HTTPException(
                status_code=404,
                detail="Route not found",
            )

        rows = db.execute(
            text(
                """
                SELECT
                    dt.id,
                    dt.name,
                    dt.type,
                    dt.config,
                    dt.enabled,
                    dt.providers,
                    rdt.enabled AS route_enabled,
                    rdt.created_at AS attached_at
                FROM route_delivery_targets rdt
                JOIN delivery_targets dt
                    ON dt.id = rdt.target_id
                WHERE rdt.route_id = :route_id
                ORDER BY rdt.created_at DESC
                """
            ),
            {
                "route_id": route_id,
            },
        ).mappings().all()

        return {
            "items": [
                {
                    "id": str(row["id"]),
                    "name": row["name"],
                    "type": row["type"],
                    "config": row["config"],
                    "enabled": bool(row["enabled"]),
                    "providers": row["providers"] or [],
                    "route_enabled": bool(
                        row["route_enabled"]
                    ),
                    "attached_at": (
                        row["attached_at"].isoformat()
                        if row["attached_at"]
                        else None
                    ),
                }
                for row in rows
            ]
        }

    finally:
        db.close()



@router.post("/{route_id}/targets/{target_id}")
def attach_target_to_route(
    route_id: int,
    target_id: str,
    user_id: str = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        route = db.execute(
            text(
                """
                SELECT id, provider
                FROM webhook_routes
                WHERE id = :route_id
                AND user_id = :user_id
                """
            ),
            {
                "route_id": route_id,
                "user_id": user_id,
            },
        ).fetchone()

        if not route:
            raise HTTPException(
                status_code=404,
                detail="Route not found",
            )

        target = db.execute(
            text(
                """
                SELECT id, name, type, providers, enabled
                FROM delivery_targets
                WHERE id = :target_id
                AND user_id = :user_id
                """
            ),
            {
                "target_id": target_id,
                "user_id": user_id,
            },
        ).fetchone()

        if not target:
            raise HTTPException(
                status_code=404,
                detail="Delivery target not found",
            )

        existing = db.execute(
            text(
                """
                SELECT id
                FROM route_delivery_targets
                WHERE route_id = :route_id
                AND target_id = :target_id
                """
            ),
            {
                "route_id": route_id,
                "target_id": target_id,
            },
        ).fetchone()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Target already attached to route",
            )

        db.execute(
            text(
                """
                INSERT INTO route_delivery_targets (
                    route_id,
                    target_id
                )
                VALUES (
                    :route_id,
                    :target_id
                )
                """
            ),
            {
                "route_id": route_id,
                "target_id": target_id,
            },
        )

        db.commit()

        return {
            "success": True,
            "route_id": route_id,
            "target_id": target_id,
            "target_name": target[1],
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    finally:
        db.close()



@router.delete("/{route_id}/targets/{target_id}")
def detach_target_from_route(
    route_id: int,
    target_id: str,
    user_id: str = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        result = db.execute(
            text(
                """
                DELETE FROM route_delivery_targets
                WHERE route_id = :route_id
                AND target_id = :target_id
                AND route_id IN (
                    SELECT id
                    FROM webhook_routes
                    WHERE id = :route_id
                    AND user_id = :user_id
                )
                """
            ),
            {
                "route_id": route_id,
                "target_id": target_id,
                "user_id": user_id,
            },
        )

        if result.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Route-target relationship not found",
            )

        db.commit()

        return {
            "success": True,
            "route_id": route_id,
            "target_id": target_id,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    finally:
        db.close()