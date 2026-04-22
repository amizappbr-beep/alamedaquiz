"""Authentication utilities for the Alameda 500 admin panel.

Single-admin model: only one admin user, seeded on startup from .env.
JWT tokens via PyJWT, stored client-side in localStorage and sent via
Authorization: Bearer header (simpler for preview/cross-origin than cookies).
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_HOURS = 24  # one work-day; admin can re-login


# ---- password hashing ----

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


# ---- JWT tokens ----

def _secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "email": email,
        "role": "admin",
        "iat": now,
        "exp": now + timedelta(hours=ACCESS_TOKEN_TTL_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])


# ---- FastAPI dependency ----

async def get_current_admin(request: Request) -> dict:
    """Require a valid admin JWT. Reads Authorization: Bearer <token>."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado.",
        )
    token = auth[7:].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token vazio.",
        )
    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado. Faça login novamente.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido.",
        )
    if payload.get("type") != "access" or payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Permissão insuficiente.",
        )
    return {"email": payload["email"], "role": payload["role"]}


# ---- Admin seed (idempotent) ----

async def seed_admin(db) -> None:
    """Create admin user if not exists, or update password if .env changed."""
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")
    if not email or not password:
        return
    existing = await db.admin_users.find_one({"email": email}, {"_id": 0})
    if existing is None:
        await db.admin_users.insert_one(
            {
                "email": email,
                "password_hash": hash_password(password),
                "name": "Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
    elif not verify_password(password, existing["password_hash"]):
        await db.admin_users.update_one(
            {"email": email},
            {"$set": {"password_hash": hash_password(password)}},
        )


# ---- Brute-force tracking ----

LOCKOUT_THRESHOLD = 5
LOCKOUT_MINUTES = 15


async def is_locked_out(db, identifier: str) -> bool:
    rec = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if not rec:
        return False
    if rec.get("count", 0) < LOCKOUT_THRESHOLD:
        return False
    locked_until_str = rec.get("locked_until")
    if not locked_until_str:
        return False
    try:
        locked_until = datetime.fromisoformat(locked_until_str)
    except ValueError:
        return False
    return locked_until > datetime.now(timezone.utc)


async def register_failed_attempt(db, identifier: str) -> None:
    now = datetime.now(timezone.utc)
    rec = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    count = (rec.get("count", 0) if rec else 0) + 1
    update = {"count": count, "last_attempt": now.isoformat()}
    if count >= LOCKOUT_THRESHOLD:
        update["locked_until"] = (now + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
    await db.login_attempts.update_one(
        {"identifier": identifier}, {"$set": update}, upsert=True
    )


async def clear_attempts(db, identifier: str) -> None:
    await db.login_attempts.delete_one({"identifier": identifier})
