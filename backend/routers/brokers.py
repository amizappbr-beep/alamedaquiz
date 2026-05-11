"""Brokers (Corretores) router — Release 2 of the Torres CRM.

Provides CRUD for sales channel owners and round-robin assignment
helpers. Protected by admin JWT.

Concept: every active broker can own leads. When a hot lead arrives
(score >= 90 or atendimento imediato) and no owner is set yet, the
backend can auto-pick the next active broker via round-robin to
balance the workload.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, ConfigDict, Field

from auth import get_current_admin

router = APIRouter(prefix="/admin/brokers", tags=["brokers"])


# --------- Channel types ---------

CHANNELS = ["direto", "indicacao", "imobiliaria", "campanha"]
ChannelLiteral = Literal["direto", "indicacao", "imobiliaria", "campanha"]


# --------- Schemas ---------


class BrokerCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(..., min_length=2, max_length=120)
    phone: Optional[str] = None
    email: Optional[str] = None
    channel: ChannelLiteral = "direto"
    active: bool = True


class BrokerUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    channel: Optional[ChannelLiteral] = None
    active: Optional[bool] = None


class Broker(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    channel: str = "direto"
    active: bool = True
    leads_count: int = 0
    created_at: str


# --------- Helpers ---------


def get_db(request: Request):
    return request.app.state.db


def _broker_to_response(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Strip mongo internals and ensure consistent shape."""
    doc.pop("_id", None)
    doc.setdefault("leads_count", 0)
    doc.setdefault("active", True)
    doc.setdefault("channel", "direto")
    return doc


async def pick_round_robin_broker(db) -> Optional[Dict[str, Any]]:
    """Pick the next active broker for round-robin assignment.

    Strategy: among active brokers, pick the one with the lowest
    `leads_count`. Ties broken by `created_at` ascending so the same
    order is preserved if we have just-created brokers.
    Returns the broker dict or None if no active brokers exist.
    """
    cursor = db.brokers.find(
        {"active": True}, {"_id": 0}
    ).sort([("leads_count", 1), ("created_at", 1)])
    candidates = await cursor.to_list(1)
    return candidates[0] if candidates else None


async def increment_broker_leads_count(db, broker_id: str) -> None:
    await db.brokers.update_one(
        {"id": broker_id}, {"$inc": {"leads_count": 1}}
    )


async def decrement_broker_leads_count(db, broker_id: str) -> None:
    await db.brokers.update_one(
        {"id": broker_id, "leads_count": {"$gt": 0}}, {"$inc": {"leads_count": -1}}
    )


# --------- Routes ---------


@router.get("")
async def list_brokers(
    request: Request,
    current=Depends(get_current_admin),
    active: Optional[bool] = None,
) -> List[Dict[str, Any]]:
    db = get_db(request)
    query: Dict[str, Any] = {}
    if active is not None:
        query["active"] = active
    cursor = db.brokers.find(query, {"_id": 0}).sort("created_at", 1)
    brokers = await cursor.to_list(200)
    return [_broker_to_response(b) for b in brokers]


@router.post("", response_model=Broker, status_code=status.HTTP_201_CREATED)
async def create_broker(
    payload: BrokerCreate,
    request: Request,
    current=Depends(get_current_admin),
):
    db = get_db(request)
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "phone": (payload.phone or "").strip() or None,
        "email": (payload.email or "").strip().lower() or None,
        "channel": payload.channel,
        "active": payload.active,
        "leads_count": 0,
        "created_at": now_iso,
    }
    await db.brokers.insert_one(doc)
    return _broker_to_response(doc)


@router.patch("/{broker_id}")
async def update_broker(
    broker_id: str,
    payload: BrokerUpdate,
    request: Request,
    current=Depends(get_current_admin),
):
    db = get_db(request)
    update: Dict[str, Any] = {}
    if payload.name is not None:
        update["name"] = payload.name.strip()
    if payload.phone is not None:
        update["phone"] = payload.phone.strip() or None
    if payload.email is not None:
        update["email"] = payload.email.strip().lower() or None
    if payload.channel is not None:
        update["channel"] = payload.channel
    if payload.active is not None:
        update["active"] = payload.active
    if not update:
        raise HTTPException(status_code=400, detail="Nada para atualizar.")
    result = await db.brokers.update_one({"id": broker_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Corretor não encontrado.")
    doc = await db.brokers.find_one({"id": broker_id}, {"_id": 0})
    return _broker_to_response(doc)


@router.delete("/{broker_id}")
async def delete_broker(
    broker_id: str,
    request: Request,
    current=Depends(get_current_admin),
):
    db = get_db(request)
    # Unassign leads from this broker before deleting
    await db.leads.update_many(
        {"owner_broker_id": broker_id},
        {"$set": {"owner_broker_id": None, "owner_broker_name": None}},
    )
    result = await db.brokers.delete_one({"id": broker_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Corretor não encontrado.")
    return {"ok": True}


@router.post("/recount")
async def recount_brokers(
    request: Request,
    current=Depends(get_current_admin),
):
    """Recompute leads_count for every broker from the leads collection.

    Useful after bulk imports or accidental drift. Idempotent.
    """
    db = get_db(request)
    pipeline = [
        {"$match": {"owner_broker_id": {"$ne": None}}},
        {"$group": {"_id": "$owner_broker_id", "count": {"$sum": 1}}},
    ]
    counts: Dict[str, int] = {}
    async for row in db.leads.aggregate(pipeline):
        if row["_id"]:
            counts[row["_id"]] = row["count"]
    # Reset all brokers then set values
    await db.brokers.update_many({}, {"$set": {"leads_count": 0}})
    for broker_id, count in counts.items():
        await db.brokers.update_one(
            {"id": broker_id}, {"$set": {"leads_count": count}}
        )
    return {"ok": True, "updated": len(counts)}
