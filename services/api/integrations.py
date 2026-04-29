from fastapi import APIRouter, Depends
from sqlalchemy import text
from .database import SessionLocal
from .auth import get_current_user
import uuid
import os

router = APIRouter(prefix="/integrations", tags=["integrations"])

BASE_URL = os.getenv("BASE_URL", "http://localhost:3001")


@router.post("/{provider}")
def connect_integration(provider: str, user_id: str = Depends(get_current_user)):
    db = SessionLocal()

    token = str(uuid.uuid4())

    db.execute(
        text("""
            INSERT INTO integrations (user_id, provider, webhook_token)
            VALUES (:user_id, :provider, :token)
        """),
        {
            "user_id": user_id,
            "provider": provider,
            "token": token,
        }
    )
    db.commit()

    return {
        "provider": provider,
        "webhook_url": f"{BASE_URL}/webhook/{token}"
    }


@router.get("")
def get_integrations(user_id: str = Depends(get_current_user)):
    db = SessionLocal()

    rows = db.execute(
        text("""
            SELECT provider, webhook_token
            FROM integrations
            WHERE user_id = :user_id
        """),
        {"user_id": user_id}
    ).mappings().all()

    return {"items": rows}


@router.delete("/{provider}")
def delete_integration(provider: str, user_id: str = Depends(get_current_user)):
    db = SessionLocal()

    db.execute(
        text("""
            DELETE FROM integrations
            WHERE user_id = :user_id AND provider = :provider
        """),
        {"user_id": user_id, "provider": provider}
    )
    db.commit()

    return {"success": True}