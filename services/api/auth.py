



from datetime import datetime, timedelta
import os
import uuid
from fastapi import Header
from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Cookie, HTTPException, Request, Depends
from fastapi.responses import JSONResponse, RedirectResponse
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import text

from.database import SessionLocal


router = APIRouter(prefix="/auth", tags=["auth"])


# -----------------------------
# Config
# -----------------------------

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")
JWT_ALGO = "HS256"
JWT_EXPIRY_HOURS = 24

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# -----------------------------
# Schemas
# -----------------------------

class RegisterSchema(BaseModel):
    email: EmailStr
    password: str


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


# -----------------------------
# JWT Helpers
# -----------------------------

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def get_current_user(
    access_token: str = Cookie(None),
    authorization: str = Header(None)
) -> str:

    token = None

    # 1. Check Authorization header
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]

    # 2. Fallback to cookie
    elif access_token:
        token = access_token

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        user_id = payload["sub"]

        db = SessionLocal()
        try:
            user = db.execute(
                text("SELECT id FROM users WHERE id = :id"),
                {"id": user_id}
            ).fetchone()

            if not user:
                raise HTTPException(status_code=401, detail="User not found")

        finally:
            db.close()

        return user_id

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
def set_auth_cookie(response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,   # change to True in production
        samesite="lax",
        max_age=60 * 60 * 24,
    )


# -----------------------------
# Register
# -----------------------------

@router.post("/register")
def register(data: RegisterSchema):
    db = SessionLocal()

    try:
        hashed_password = pwd_context.hash(data.password)

        user_id = str(uuid.uuid4())
        api_key = str(uuid.uuid4())

        db.execute(
            text("""
                INSERT INTO users (id, email, password_hash, api_key, provider)
                VALUES (:id, :email, :password, :api_key, 'local')
            """),
            {
                "id": user_id,
                "email": data.email,
                "password": hashed_password,
                "api_key": api_key,
            },
        )

        db.commit()

        token = create_token(user_id)

        response = JSONResponse({"success": True, "access_token": token})
        set_auth_cookie(response, token)

        return response

    except Exception as e:
        db.rollback()
        print("REGISTER ERROR:", repr(e))
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        db.close()


# -----------------------------
# Login
# -----------------------------

@router.post("/login")
def login(data: LoginSchema):
    db = SessionLocal()

    try:
        user = db.execute(
            text("SELECT id, password_hash FROM users WHERE email = :email"),
            {"email": data.email},
        ).fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_id, password_hash = user
        user_id = str(user_id)

        if not pwd_context.verify(data.password, password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_token(user_id)

        response = JSONResponse({"success": True, "access_token": token})
        set_auth_cookie(response, token)

        return response

    finally:
        db.close()


# -----------------------------
# Logout
# -----------------------------

@router.post("/logout")
def logout():
    response = JSONResponse({"success": True})
    response.delete_cookie("access_token")
    return response


# -----------------------------
# OAuth Setup
# -----------------------------

oauth = OAuth()

oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

oauth.register(
    name="github",
    client_id=os.getenv("GITHUB_CLIENT_ID"),
    client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",
    client_kwargs={"scope": "user:email"},
)


# -----------------------------
# OAuth Login
# -----------------------------

@router.get("/login/{provider}")
async def oauth_login(request: Request, provider: str):

    if provider not in ["google", "github"]:
        raise HTTPException(status_code=400, detail="Invalid provider")

    redirect_uri = request.url_for("oauth_callback", provider=provider)

    client = oauth.create_client(provider)

    return await client.authorize_redirect(request, redirect_uri)


@router.get("/callback/{provider}")
async def oauth_callback(request: Request, provider: str):

    if provider not in ["google", "github"]:
        raise HTTPException(status_code=400, detail="Invalid provider")

    client = oauth.create_client(provider)

    token = await client.authorize_access_token(request)

    # Google
    if provider == "google":
        user = await client.parse_id_token(request, token)
        email = user["email"]
        provider_id = user["sub"]
        avatar = user.get("picture")

    # GitHub
    else:
        resp = await client.get("user", token=token)
        profile = resp.json()

        provider_id = str(profile["id"])
        avatar = profile.get("avatar_url")

        emails_resp = await client.get("user/emails", token=token)
        emails = emails_resp.json()

        email = next((e["email"] for e in emails if e["primary"]), None)

    db = SessionLocal()

    try:
        existing = db.execute(
            text("""
                SELECT id FROM users
                WHERE provider = :provider
                AND provider_id = :provider_id
            """),
            {"provider": provider, "provider_id": provider_id},
        ).fetchone()

        if existing:
            user_id = existing[0]

        else:
            user_id = str(uuid.uuid4())
            api_key = str(uuid.uuid4())

            db.execute(
                text("""
                    INSERT INTO users (
                        id, email, provider, provider_id,
                        avatar_url, api_key
                    )
                    VALUES (
                        :id, :email, :provider, :provider_id,
                        :avatar, :api_key
                    )
                """),
                {
                    "id": user_id,
                    "email": email,
                    "provider": provider,
                    "provider_id": provider_id,
                    "avatar": avatar,
                    "api_key": api_key,
                },
            )

            db.commit()

        jwt_token = create_token(user_id)

        response = RedirectResponse(f"{FRONTEND_URL}/dashboard")
        set_auth_cookie(response, jwt_token)

        return response

    finally:
        db.close()


# -----------------------------
# Get Current User
# -----------------------------

@router.get("/me")
def get_me(user_id: str = Depends(get_current_user)):

    db = SessionLocal()

    try:
        user = db.execute(
            text("""
                SELECT id, email, avatar_url, provider
                FROM users
                WHERE id = :user_id
            """),
            {"user_id": user_id},
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "id": str(user[0]),
            "email": user[1],
            "avatar_url": user[2],
            "provider": user[3],
        }

    finally:
        db.close()