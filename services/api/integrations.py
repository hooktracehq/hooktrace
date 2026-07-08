from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy import text

from .database import SessionLocal
from .auth import get_current_user

import uuid
import os


router = APIRouter(
    prefix="/integrations",
    tags=["integrations"],
)


BASE_URL = os.getenv(
    "BASE_URL",
    "http://localhost:3001",
)


@router.post("/{provider}")
def connect_integration(
    provider: str,
    user_id: str = Depends(
        get_current_user
    ),
):

    db = SessionLocal()

    token = str(uuid.uuid4())

    route = provider

    try:

        # ---------------------------------
        # PREVENT DUPLICATE INTEGRATIONS
        # ---------------------------------

        existing = db.execute(
            text("""
                SELECT
                    webhook_token
                FROM integrations
                WHERE user_id = :user_id
                AND provider = :provider
            """),
            {
                "user_id": user_id,
                "provider": provider,
            },
        ).mappings().first()

        if existing:

            existing_token = existing[
                "webhook_token"
            ]

            return {
                "provider": provider,
                "already_connected": True,
                "webhook_url": (
                    f"{BASE_URL}"
                    f"/r/{existing_token}/{route}"
                ),
            }

        # ---------------------------------
        # CREATE WEBHOOK ROUTE
        # ---------------------------------

        route_id = db.execute(
    text("""
        INSERT INTO webhook_routes (
            user_id,
            token,
            route,
            provider
        )
        VALUES (
            :user_id,
            :token,
            :route,
            :provider
        )
        RETURNING id
    """),
    {
        "user_id": user_id,
        "token": token,
        "route": route,
        "provider": provider,
    },
).scalar()

        # ---------------------------------
        # CREATE INTEGRATION
        # ---------------------------------

        db.execute(
            text("""
                INSERT INTO integrations (
                    user_id,
                    provider,
                    webhook_token,
                    route_id,
                    status
                )
                VALUES (
                    :user_id,
                    :provider,
                    :token,
                    :route_id,
                    'connected'
                )
            """),
            {
                "user_id": user_id,
                "provider": provider,
                "token": token,
                "route_id": route_id,
            },
        )

        db.commit()

        return {
            "provider": provider,
            "connected": True,
            "webhook_url": (
                f"{BASE_URL}"
                f"/r/{token}/{route}"
            ),
        }

    finally:
        db.close()


@router.get("")
def get_integrations(
    user_id: str = Depends(
        get_current_user
    ),
):

    db = SessionLocal()

    try:

        rows = db.execute(
            text("""
                SELECT
                    i.provider,
                    i.webhook_token,
                    i.status,
                    r.route,
                    r.created_at
                FROM integrations i
                JOIN webhook_routes r
                  ON i.route_id = r.id
                WHERE i.user_id = :user_id
                ORDER BY r.created_at DESC
            """),
            {
                "user_id": user_id,
            },
        ).mappings().all()

        items = []

        for row in rows:

            items.append({
                "provider": row[
                    "provider"
                ],
                "status": row[
                    "status"
                ],
                "route": row[
                    "route"
                ],
                "webhook_url": (
                    f"{BASE_URL}"
                    f"/r/"
                    f"{row['webhook_token']}/"
                    f"{row['route']}"
                ),
                "created_at": (
                    row["created_at"].isoformat()
                    if row["created_at"]
                    else None
                ),
            })

        return {
            "items": items
        }

    finally:
        db.close()


@router.delete("/{provider}")
def delete_integration(
    provider: str,
    user_id: str = Depends(
        get_current_user
    ),
):

    db = SessionLocal()

    try:

        integration = db.execute(
            text("""
                SELECT
                    route_id
                FROM integrations
                WHERE user_id = :user_id
                AND provider = :provider
            """),
            {
                "user_id": user_id,
                "provider": provider,
            },
        ).mappings().first()

        if not integration:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Integration not found"
                ),
            )

        route_id = integration[
            "route_id"
        ]

        # -----------------------------
        # DELETE WEBHOOK ROUTE
        # -----------------------------

        db.execute(
            text("""
                DELETE FROM webhook_routes
                WHERE id = :route_id
                AND user_id = :user_id
            """),
            {
                "route_id": route_id,
                "user_id": user_id,
            },
        )

        # -----------------------------
        # DELETE INTEGRATION
        # -----------------------------

        db.execute(
            text("""
                DELETE FROM integrations
                WHERE user_id = :user_id
                AND provider = :provider
            """),
            {
                "user_id": user_id,
                "provider": provider,
            },
        )

        db.commit()

        return {
            "success": True,
            "provider": provider,
        }

    finally:
        db.close()




@router.get("/stats")
def get_integration_stats(
    user_id: str = Depends(
        get_current_user
    ),
):
    db = SessionLocal()

    try:

        providers = db.execute(
            text("""
                SELECT COUNT(*)
                FROM integrations
                WHERE user_id = :user_id
            """),
            {
                "user_id": user_id,
            },
        ).scalar()

        healthy = db.execute(
            text("""
                SELECT COUNT(*)
                FROM integrations
                WHERE user_id = :user_id
                AND status = 'connected'
            """),
            {
                "user_id": user_id,
            },
        ).scalar()

        errors = db.execute(
            text("""
                SELECT COUNT(*)
                FROM integrations
                WHERE user_id = :user_id
                AND status != 'connected'
            """),
            {
                "user_id": user_id,
            },
        ).scalar()

        events_today = db.execute(
            text("""
                SELECT COUNT(*)
                FROM webhook_events e
                JOIN webhook_routes r
                  ON e.route_id = r.id
                WHERE r.user_id = :user_id
                AND DATE(e.created_at) = CURRENT_DATE
            """),
            {
                "user_id": user_id,
            },
        ).scalar()

        return {
            "providers": providers,
            "healthy": healthy,
            "errors": errors,
            "events_today": events_today,
        }

    finally:
        db.close()