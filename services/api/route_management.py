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

                    'active' AS status

                FROM webhook_routes r

                LEFT JOIN webhook_events e
                    ON e.route_id = r.id

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
                    "destinations": len(
                        [
                            target
                            for target in [
                                row["dev_target"],
                                row["prod_target"],
                            ]
                            if target
                        ]
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