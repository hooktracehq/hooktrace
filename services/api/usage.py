from fastapi import APIRouter, Depends
from sqlalchemy import text
from database import SessionLocal
from auth import get_current_user

router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("/")
def get_usage(user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        count = db.execute(
            text("""
                SELECT COUNT(*)
                FROM usage_metrics
                WHERE user_id = :user_id
                AND created_at >= date_trunc('month', now())
            """),
            {"user_id": user_id},
        ).scalar()

        return {"monthly_events": count}
    finally:
        db.close()