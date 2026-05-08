"""Admin panel routes — protected by JWT auth.

Provides: login, /me, lead list with filters, lead detail, status
transitions (Kanban), notes, and aggregate metrics for dashboard.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field, ConfigDict

from auth import (
    clear_attempts,
    create_access_token,
    get_current_admin,
    is_locked_out,
    register_failed_attempt,
    verify_password,
)

router = APIRouter(prefix="/admin", tags=["admin"])


# --------- Kanban status ---------

LEAD_STATUSES = [
    "novo",
    "contatado",
    "agendado",
    "negociacao",
    "ganho",
    "perdido",
]

LeadStatusLiteral = Literal[
    "novo", "contatado", "agendado", "negociacao", "ganho", "perdido"
]


# --------- Schemas ---------


class LoginPayload(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    expires_in: int  # seconds


class StatusUpdatePayload(BaseModel):
    status: LeadStatusLiteral


class NotePayload(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class AdminNote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    text: str
    author: str
    created_at: str


# --------- Dependency to inject db ---------


def get_db(request: Request):
    return request.app.state.db


# --------- Auth endpoints ---------


@router.post("/login", response_model=LoginResponse)
async def admin_login(payload: LoginPayload, request: Request):
    db = get_db(request)
    email = payload.email.strip().lower()
    # Brute-force identifier scoped to the email (single-admin panel). Using
    # email-only avoids proxy/ingress IP rotation (X-Forwarded-For chains)
    # evading the rate-limit by cycling source addresses.
    identifier = email

    if await is_locked_out(db, identifier):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas tentativas. Tente novamente em 15 minutos.",
        )

    user = await db.admin_users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await register_failed_attempt(db, identifier)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos.",
        )

    await clear_attempts(db, identifier)

    token = create_access_token(email)
    from auth import ACCESS_TOKEN_TTL_HOURS
    return LoginResponse(
        access_token=token,
        email=email,
        expires_in=ACCESS_TOKEN_TTL_HOURS * 3600,
    )


@router.get("/me")
async def admin_me(current=Depends(get_current_admin)):
    return current


# --------- Leads (Kanban) ---------


@router.get("/leads")
async def admin_list_leads(
    request: Request,
    current=Depends(get_current_admin),
    status: Optional[LeadStatusLiteral] = None,
    temperatura: Optional[Literal["quente", "morno", "frio"]] = None,
    nutricao: Optional[bool] = None,  # True = só leads em nutrição
    q: Optional[str] = None,
    limit: int = 500,
):
    db = get_db(request)
    query: Dict[str, Any] = {}
    if status:
        query["status"] = status
    if temperatura:
        query["temperatura"] = temperatura
    if nutricao is True:
        query["nutricao_warehouse"] = {"$ne": None}
    elif nutricao is False:
        query["nutricao_warehouse"] = None
    if q:
        q_re = {"$regex": q.strip(), "$options": "i"}
        query["$or"] = [{"name": q_re}, {"phone": q_re}, {"email": q_re}]

    leads = (
        await db.leads.find(query, {"_id": 0})
        .sort("created_at", -1)
        .to_list(limit)
    )
    # Default status = "novo" for legacy leads without it.
    for lead in leads:
        lead.setdefault("status", "novo")
    return leads


@router.get("/leads/{lead_id}")
async def admin_lead_detail(
    lead_id: str, request: Request, current=Depends(get_current_admin)
):
    db = get_db(request)
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado.")
    lead.setdefault("status", "novo")
    lead.setdefault("admin_notes", [])
    return lead


@router.patch("/leads/{lead_id}/status")
async def admin_update_status(
    lead_id: str,
    payload: StatusUpdatePayload,
    request: Request,
    current=Depends(get_current_admin),
):
    db = get_db(request)
    now_iso = datetime.now(timezone.utc).isoformat()
    result = await db.leads.update_one(
        {"id": lead_id},
        {
            "$set": {"status": payload.status, "updated_at": now_iso},
            "$push": {
                "status_history": {
                    "from": None,  # can be enhanced to read previous value first
                    "to": payload.status,
                    "by": current["email"],
                    "at": now_iso,
                }
            },
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead não encontrado.")
    return {"ok": True, "status": payload.status}


@router.post("/leads/{lead_id}/notes")
async def admin_add_note(
    lead_id: str,
    payload: NotePayload,
    request: Request,
    current=Depends(get_current_admin),
):
    db = get_db(request)
    note = {
        "text": payload.text.strip(),
        "author": current["email"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.leads.update_one(
        {"id": lead_id},
        {"$push": {"admin_notes": note}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead não encontrado.")
    return note


# --------- Metrics ---------


@router.get("/warehouse")
async def admin_warehouse(
    request: Request,
    current=Depends(get_current_admin),
    faixa: Optional[Literal["300k", "350k", "400k", "450k", "500k"]] = None,
    momento: Optional[Literal["0-3m", "3-6m", "6-12m", "12m+", "sem_pressa"]] = None,
    regiao: Optional[str] = None,
    tipo: Optional[Literal["casa", "apartamento", "qualquer"]] = None,
):
    """Lead Warehouse — leads em nutrição agrupados por faixa de interesse,
    com filtros para 'match automático' (faixa+momento+região+tipo).
    Retorna agregações + lista de leads compatíveis.
    """
    db = get_db(request)

    base_query: Dict[str, Any] = {"nutricao_warehouse": {"$ne": None}}
    if faixa:
        base_query["nutricao_warehouse.faixas_interesse"] = faixa
    if momento:
        base_query["nutricao_warehouse.momento_compra"] = momento
    if regiao:
        base_query["nutricao_warehouse.regiao_preferida"] = regiao
    if tipo:
        base_query["nutricao_warehouse.tipo_preferido"] = tipo

    # Distribuição por faixa (sempre sobre o universo total de nutrição —
    # ignorando filtro de faixa pra mostrar o quadro completo)
    universe_query = {"nutricao_warehouse": {"$ne": None}}
    if momento:
        universe_query["nutricao_warehouse.momento_compra"] = momento
    if regiao:
        universe_query["nutricao_warehouse.regiao_preferida"] = regiao
    if tipo:
        universe_query["nutricao_warehouse.tipo_preferido"] = tipo

    # Counts por faixa via aggregation
    pipeline_faixas = [
        {"$match": universe_query},
        {"$unwind": "$nutricao_warehouse.faixas_interesse"},
        {"$group": {"_id": "$nutricao_warehouse.faixas_interesse", "count": {"$sum": 1}}},
    ]
    by_faixa = {"300k": 0, "350k": 0, "400k": 0, "450k": 0, "500k": 0}
    async for row in db.leads.aggregate(pipeline_faixas):
        if row["_id"] in by_faixa:
            by_faixa[row["_id"]] = row["count"]

    # Counts por momento (sob o filtro corrente)
    pipeline_momento = [
        {"$match": base_query},
        {"$group": {"_id": "$nutricao_warehouse.momento_compra", "count": {"$sum": 1}}},
    ]
    by_momento: Dict[str, int] = {}
    async for row in db.leads.aggregate(pipeline_momento):
        if row["_id"]:
            by_momento[row["_id"]] = row["count"]

    # Counts por região (sob o filtro corrente)
    pipeline_regiao = [
        {"$match": base_query},
        {"$group": {"_id": "$nutricao_warehouse.regiao_preferida", "count": {"$sum": 1}}},
    ]
    by_regiao: Dict[str, int] = {}
    async for row in db.leads.aggregate(pipeline_regiao):
        if row["_id"]:
            by_regiao[row["_id"]] = row["count"]

    # Leads (lista filtrada)
    leads = (
        await db.leads.find(base_query, {"_id": 0})
        .sort("nutricao_warehouse.captured_at", -1)
        .to_list(500)
    )
    for lead in leads:
        lead.setdefault("status", "novo")

    total_filtered = len(leads)

    return {
        "total": total_filtered,
        "by_faixa": by_faixa,
        "by_momento": by_momento,
        "by_regiao": by_regiao,
        "leads": leads,
        "filters": {"faixa": faixa, "momento": momento, "regiao": regiao, "tipo": tipo},
    }


@router.get("/metrics")
async def admin_metrics(request: Request, current=Depends(get_current_admin)):
    db = get_db(request)

    total = await db.leads.count_documents({})
    quente = await db.leads.count_documents({"temperatura": "quente"})
    morno = await db.leads.count_documents({"temperatura": "morno"})
    frio = await db.leads.count_documents({"temperatura": "frio"})
    imediatos = await db.leads.count_documents({"solicita_atendimento_imediato": True})
    agendados = await db.leads.count_documents({"agendamento": {"$ne": None}})
    com_simulacao = await db.leads.count_documents({"simulacao.renda_bruta": {"$gt": 0}})
    com_casa = await db.leads.count_documents({"casa_preferida": {"$ne": None}})
    em_nutricao = await db.leads.count_documents({"nutricao_warehouse": {"$ne": None}})

    # Counts by kanban status (include legacy "novo" default)
    status_counts = {s: 0 for s in LEAD_STATUSES}
    pipeline_status = [
        {"$group": {"_id": {"$ifNull": ["$status", "novo"]}, "count": {"$sum": 1}}}
    ]
    async for row in db.leads.aggregate(pipeline_status):
        key = row["_id"]
        if key in status_counts:
            status_counts[key] = row["count"]

    # Score stats
    pipeline_score = [
        {"$match": {"lead_score": {"$gt": 0}}},
        {"$group": {"_id": None, "avg": {"$avg": "$lead_score"}, "max": {"$max": "$lead_score"}}},
    ]
    score_stats = await db.leads.aggregate(pipeline_score).to_list(1)
    avg_score = round(score_stats[0]["avg"], 1) if score_stats else 0
    max_score = score_stats[0]["max"] if score_stats else 0

    # Last 7 days count
    from datetime import timedelta as _td
    seven_days_ago = (datetime.now(timezone.utc) - _td(days=7)).isoformat()
    ultimos_7d = await db.leads.count_documents({"created_at": {"$gte": seven_days_ago}})

    return {
        "total": total,
        "ultimos_7d": ultimos_7d,
        "temperatura": {"quente": quente, "morno": morno, "frio": frio},
        "kanban": status_counts,
        "agendamentos": agendados,
        "atendimentos_imediatos": imediatos,
        "com_simulacao": com_simulacao,
        "com_casa_preferida": com_casa,
        "em_nutricao": em_nutricao,
        "score_medio": avg_score,
        "score_maximo": max_score,
    }
