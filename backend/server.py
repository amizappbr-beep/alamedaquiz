from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Literal, Optional, Dict, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Alameda 500 — Concierge Digital API")
api_router = APIRouter(prefix="/api")


# -------------------- Models --------------------
class QuizAnswer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    question_id: str
    question: str
    answer: str


class Agendamento(BaseModel):
    model_config = ConfigDict(extra="ignore")
    data: str
    horario: str
    formato: Literal["decorado", "imovel", "videochamada"]  # "decorado" kept for legacy compat
    observacao: Optional[str] = None


class Simulacao(BaseModel):
    model_config = ConfigDict(extra="ignore")
    renda_bruta: Optional[float] = None
    entrada: Optional[float] = None
    fgts: Optional[float] = None
    prazo_meses: Optional[int] = None
    parcela_estimada: Optional[float] = None
    faixa_mcmv: Optional[str] = None
    unidade_numero: Optional[int] = None
    valor_imovel: Optional[float] = None
    sinal_total: Optional[float] = None
    valor_financiado: Optional[float] = None
    aprovado: Optional[bool] = None


class Interacao(BaseModel):
    model_config = ConfigDict(extra="ignore")
    tipo: str
    modulo: Optional[str] = None
    detalhe: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LeadCreate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    modulos_visitados: List[str] = Field(default_factory=list)
    quiz_answers: List[QuizAnswer] = Field(default_factory=list)
    classification: Optional[Literal["quente", "morno", "frio"]] = None
    casa_preferida: Optional[str] = None
    simulacao: Optional[Simulacao] = None
    agendamento: Optional[Agendamento] = None
    solicita_atendimento_imediato: bool = False
    interacoes: List[Interacao] = Field(default_factory=list)
    tempo_total_segundos: int = 0
    origem: Optional[str] = None
    channel: Optional[Literal["direto", "indicacao", "imobiliaria", "campanha"]] = "direto"


class NutricaoWarehouse(BaseModel):
    """Sinal de nutrição: o lead disse 'me avise quando lançar...'.
    Vai alimentar o futuro Lead Warehouse multi-empreendimento."""
    model_config = ConfigDict(extra="ignore")
    faixas_interesse: List[Literal["300k", "350k", "400k", "450k", "500k"]] = Field(default_factory=list)
    momento_compra: Optional[Literal["0-3m", "3-6m", "6-12m", "12m+", "sem_pressa"]] = None
    tipo_preferido: Optional[Literal["casa", "apartamento", "qualquer"]] = None
    regiao_preferida: Optional[str] = None  # ex: serra, vitoria, vila_velha, qualquer
    observacoes: Optional[str] = None
    captured_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source: Optional[str] = None  # 'capa' | 'obrigado' — onde o usuário preencheu


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    modulos_visitados: List[str] = Field(default_factory=list)
    quiz_answers: List[QuizAnswer] = Field(default_factory=list)
    classification: Optional[str] = None
    casa_preferida: Optional[str] = None
    simulacao: Optional[Simulacao] = None
    agendamento: Optional[Agendamento] = None
    solicita_atendimento_imediato: bool = False
    interacoes: List[Interacao] = Field(default_factory=list)
    tempo_total_segundos: int = 0
    lead_score: int = 0
    temperatura: str = "frio"
    origem: Optional[str] = None
    status: str = "novo"  # Kanban: novo|contatado|agendado|negociacao|ganho|perdido
    channel: str = "direto"  # direto|indicacao|imobiliaria|campanha
    owner_broker_id: Optional[str] = None
    owner_broker_name: Optional[str] = None
    nutricao_warehouse: Optional[NutricaoWarehouse] = None
    admin_notes: List[Dict[str, Any]] = Field(default_factory=list)
    status_history: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -------------------- Tabela de vendas --------------------
UNIDADES_TABELA = [
    {"numero": 1, "modelo": "1_12", "nome": "Premium", "status": "disponivel", "preco": 460000},
    {"numero": 2, "modelo": "2_a_11", "nome": "Essencial", "status": "reservada", "preco": 349000},
    {"numero": 3, "modelo": "2_a_11", "nome": "Essencial", "status": "disponivel", "preco": 349000},
    {"numero": 4, "modelo": "2_a_11", "nome": "Essencial", "status": "disponivel", "preco": 349000},
    {"numero": 5, "modelo": "2_a_11", "nome": "Essencial", "status": "disponivel", "preco": 349000},
    {"numero": 6, "modelo": "6_7", "nome": "Família", "status": "reservada", "preco": 380000},
    {"numero": 7, "modelo": "6_7", "nome": "Família", "status": "disponivel", "preco": 380000},
    {"numero": 8, "modelo": "2_a_11", "nome": "Essencial", "status": "vendida", "preco": 349000},
    {"numero": 9, "modelo": "2_a_11", "nome": "Essencial", "status": "disponivel", "preco": 349000},
    {"numero": 10, "modelo": "2_a_11", "nome": "Essencial", "status": "reservada", "preco": 349000},
    {"numero": 11, "modelo": "2_a_11", "nome": "Essencial", "status": "disponivel", "preco": 349000},
    {"numero": 12, "modelo": "1_12", "nome": "Premium", "status": "vendida", "preco": 460000},
]

FAIXAS_MCMV_SRV = [
    {"id": "1", "nome": "Faixa 1", "renda_max": 2850, "taxa_aa": 0.045, "subsidio": 55000},
    {"id": "2", "nome": "Faixa 2", "renda_max": 4700, "taxa_aa": 0.055, "subsidio": 30000},
    {"id": "3", "nome": "Faixa 3", "renda_max": 8600, "taxa_aa": 0.0775, "subsidio": 0},
    {"id": "sbpe", "nome": "SBPE", "renda_max": 10**9, "taxa_aa": 0.105, "subsidio": 0},
]

CONDICOES = {
    "pct_sinal": 0.13,
    "pct_ate_chaves": 0.20,
    "pct_financiado": 0.80,
    "meses_obra": 18,
    "residual_max": 20000,
    "residual_meses": 20,
}


# -------------------- Business logic --------------------
def compute_lead_score(payload: LeadCreate) -> int:
    score = 0
    mods = set(payload.modulos_visitados)
    if "empreendimento" in mods:
        score += 10
    if "casas" in mods and payload.casa_preferida:
        score += 15
    if "diferenciais" in mods:
        score += 5
    if "perfil" in mods and len(payload.quiz_answers) >= 6:
        if payload.classification == "quente":
            score += 30
        elif payload.classification == "morno":
            score += 20
        else:
            score += 10
    if "simulador" in mods and payload.simulacao and payload.simulacao.renda_bruta:
        score += 25
    if payload.agendamento:
        score += 40
    if payload.solicita_atendimento_imediato:
        score += 50
    tempo_pts = min(20, (payload.tempo_total_segundos // 30) * 5)
    score += tempo_pts
    return min(150, score)


def compute_temperature(score: int) -> str:
    if score >= 90:
        return "quente"
    if score >= 45:
        return "morno"
    return "frio"


def _identificar_faixa(renda: float):
    for f in FAIXAS_MCMV_SRV:
        if renda <= f["renda_max"]:
            return f
    return FAIXAS_MCMV_SRV[-1]


def _parcela_price(pv: float, taxa_aa: float, meses: int) -> float:
    if pv <= 0 or meses <= 0:
        return 0
    taxa_am = (1 + taxa_aa) ** (1 / 12) - 1
    if taxa_am == 0:
        return pv / meses
    return (pv * taxa_am * (1 + taxa_am) ** meses) / ((1 + taxa_am) ** meses - 1)


# -------------------- Routes --------------------
@api_router.get("/")
async def root():
    return {"message": "Alameda 500 — Concierge Digital API", "status": "ok", "version": "2.1"}


@api_router.get("/unidades")
async def get_unidades():
    disponiveis = sum(1 for u in UNIDADES_TABELA if u["status"] == "disponivel")
    reservadas = sum(1 for u in UNIDADES_TABELA if u["status"] == "reservada")
    vendidas = sum(1 for u in UNIDADES_TABELA if u["status"] == "vendida")
    return {
        "unidades": UNIDADES_TABELA,
        "resumo": {
            "total": len(UNIDADES_TABELA),
            "disponivel": disponiveis,
            "reservada": reservadas,
            "vendida": vendidas,
        },
        "condicoes": CONDICOES,
    }


class SimulacaoInput(BaseModel):
    unidade_numero: Optional[int] = None
    modelo_id: Optional[str] = None
    renda_bruta: float
    entrada: float = 0  # valor disponível HOJE para o sinal
    fgts: float = 0  # saldo FGTS — usado no financiamento bancário
    capacidade_mensal: Optional[float] = None  # capacidade mensal durante a obra
    prazo_meses: int = 360
    parcelas_sinal: int = 3
    usar_residual_pos_chaves: bool = False


@api_router.post("/simulacao")
async def simular(payload: SimulacaoInput):
    unidade = None
    valor_imovel = None
    if payload.unidade_numero is not None:
        unidade = next((u for u in UNIDADES_TABELA if u["numero"] == payload.unidade_numero), None)
        if unidade is None:
            raise HTTPException(status_code=404, detail="Unidade não encontrada.")
        if unidade["status"] != "disponivel":
            raise HTTPException(
                status_code=409, detail=f"Unidade {payload.unidade_numero} está {unidade['status']}."
            )
        valor_imovel = unidade["preco"]
    elif payload.modelo_id:
        disp = [u for u in UNIDADES_TABELA if u["modelo"] == payload.modelo_id and u["status"] == "disponivel"]
        if not disp:
            raise HTTPException(status_code=404, detail="Nenhuma unidade disponível para o modelo.")
        unidade = disp[0]
        valor_imovel = disp[0]["preco"]
    else:
        raise HTTPException(status_code=400, detail="Informe unidade_numero ou modelo_id.")

    renda = payload.renda_bruta
    faixa = _identificar_faixa(renda)

    sinal_total = valor_imovel * CONDICOES["pct_sinal"]
    ate_chaves_total = valor_imovel * CONDICOES["pct_ate_chaves"]
    complemento = ate_chaves_total - sinal_total
    meses_comp = max(1, CONDICOES["meses_obra"] - payload.parcelas_sinal)

    residual = CONDICOES["residual_max"] if payload.usar_residual_pos_chaves else 0
    # FGTS reduz diretamente o financiamento bancário (aplicado na liberação do banco)
    financiado_bruto = valor_imovel * CONDICOES["pct_financiado"] - residual
    financiado_liquido = max(0, financiado_bruto - (payload.fgts or 0))

    parcela_bancaria = _parcela_price(financiado_liquido, faixa["taxa_aa"], payload.prazo_meses)
    parcela_sinal = sinal_total / payload.parcelas_sinal
    parcela_complemento = complemento / meses_comp
    parcela_residual = residual / CONDICOES["residual_meses"] if residual > 0 else 0

    limite = renda * 0.30
    aprovado_capacidade = parcela_bancaria <= limite
    # Check 1: consegue pagar a 1ª parcela do sinal hoje?
    sinal_ok = (payload.entrada or 0) >= parcela_sinal * 0.95
    # Check 2: capacidade mensal cobre o complemento (se informada)
    complemento_ok = (
        payload.capacidade_mensal is None
        or payload.capacidade_mensal >= parcela_complemento * 0.95
    )
    aprovado = aprovado_capacidade and sinal_ok and complemento_ok and financiado_liquido > 0

    razoes = []
    if not aprovado_capacidade:
        razoes.append(
            f"Parcela bancária de R$ {parcela_bancaria:.0f} supera 30% da renda (limite R$ {limite:.0f})."
        )
    if not sinal_ok:
        razoes.append(
            f"Para o sinal em {payload.parcelas_sinal}x, é preciso ao menos R$ {parcela_sinal:.0f} hoje (você informou R$ {(payload.entrada or 0):.0f})."
        )
    if not complemento_ok:
        razoes.append(
            f"A capacidade mensal informada (R$ {(payload.capacidade_mensal or 0):.0f}) não cobre as parcelas de R$ {parcela_complemento:.0f} até as chaves."
        )

    return {
        "unidade": unidade,
        "valor_imovel": valor_imovel,
        "faixa": faixa,
        "sinal_total": round(sinal_total, 2),
        "parcela_sinal": round(parcela_sinal, 2),
        "parcelas_sinal": payload.parcelas_sinal,
        "complemento_ate_chaves": round(complemento, 2),
        "parcela_complemento": round(parcela_complemento, 2),
        "meses_complemento": meses_comp,
        "ate_chaves_total": round(ate_chaves_total, 2),
        "valor_financiado": round(financiado_liquido, 2),
        "valor_financiado_bruto": round(financiado_bruto, 2),
        "parcela_bancaria": round(parcela_bancaria, 2),
        "prazo_meses": payload.prazo_meses,
        "taxa_aa": faixa["taxa_aa"],
        "residual": round(residual, 2),
        "parcela_residual": round(parcela_residual, 2),
        "limite_comprometimento": round(limite, 2),
        "aprovado_capacidade": aprovado_capacidade,
        "sinal_ok": sinal_ok,
        "complemento_ok": complemento_ok,
        "aprovado": aprovado,
        "razoes": razoes,
    }


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    finalizing = payload.solicita_atendimento_imediato or payload.agendamento is not None
    if finalizing:
        if not payload.name or not payload.name.strip():
            raise HTTPException(status_code=400, detail="Nome é obrigatório para finalizar.")
        if not payload.phone or not payload.phone.strip():
            raise HTTPException(status_code=400, detail="WhatsApp é obrigatório para finalizar.")

    score = compute_lead_score(payload)
    temperatura = compute_temperature(score)

    lead = Lead(
        name=(payload.name or "").strip() or None,
        phone=(payload.phone or "").strip() or None,
        email=(payload.email or "").strip() or None,
        modulos_visitados=list(dict.fromkeys(payload.modulos_visitados)),
        quiz_answers=payload.quiz_answers,
        classification=payload.classification,
        casa_preferida=payload.casa_preferida,
        simulacao=payload.simulacao,
        agendamento=payload.agendamento,
        solicita_atendimento_imediato=payload.solicita_atendimento_imediato,
        interacoes=payload.interacoes,
        tempo_total_segundos=payload.tempo_total_segundos,
        lead_score=score,
        temperatura=temperatura,
        origem=payload.origem,
        channel=payload.channel or "direto",
    )

    # Round-robin auto-assignment for hot leads (score >= 90 OR atendimento
    # imediato OR agendou visita). Cold/warm leads stay unowned so the team
    # can pull manually from the Kanban.
    auto_assign = (
        score >= 90
        or payload.solicita_atendimento_imediato
        or payload.agendamento is not None
    )
    if auto_assign:
        from routers.brokers import (
            pick_round_robin_broker,
            increment_broker_leads_count,
        )
        broker = await pick_round_robin_broker(db)
        if broker:
            lead.owner_broker_id = broker["id"]
            lead.owner_broker_name = broker["name"]
            await increment_broker_leads_count(db, broker["id"])

    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    for inter in doc.get('interacoes', []):
        if isinstance(inter.get('timestamp'), datetime):
            inter['timestamp'] = inter['timestamp'].isoformat()

    await db.leads.insert_one(doc)
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads(
    limit: int = 200,
    classification: Optional[str] = None,
    temperatura: Optional[str] = None,
    min_score: Optional[int] = None,
):
    query: Dict[str, Any] = {}
    if classification in {"quente", "morno", "frio"}:
        query["classification"] = classification
    if temperatura in {"quente", "morno", "frio"}:
        query["temperatura"] = temperatura
    if min_score is not None:
        query["lead_score"] = {"$gte": min_score}

    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for lead in leads:
        for k in ("created_at", "updated_at"):
            if isinstance(lead.get(k), str):
                try:
                    lead[k] = datetime.fromisoformat(lead[k])
                except Exception:
                    pass
        for inter in lead.get('interacoes', []):
            if isinstance(inter.get('timestamp'), str):
                try:
                    inter['timestamp'] = datetime.fromisoformat(inter['timestamp'])
                except Exception:
                    pass
    return leads


@api_router.get("/leads/summary")
async def leads_summary():
    total = await db.leads.count_documents({})
    quente = await db.leads.count_documents({"temperatura": "quente"})
    morno = await db.leads.count_documents({"temperatura": "morno"})
    frio = await db.leads.count_documents({"temperatura": "frio"})
    agendados = await db.leads.count_documents({"agendamento": {"$ne": None}})
    imediatos = await db.leads.count_documents({"solicita_atendimento_imediato": True})

    pipeline = [
        {"$match": {"lead_score": {"$gt": 0}}},
        {"$group": {"_id": None, "avg": {"$avg": "$lead_score"}, "max": {"$max": "$lead_score"}}},
    ]
    stats = await db.leads.aggregate(pipeline).to_list(1)
    avg_score = round(stats[0]["avg"], 1) if stats else 0
    max_score = stats[0]["max"] if stats else 0

    return {
        "total": total,
        "temperatura": {"quente": quente, "morno": morno, "frio": frio},
        "agendamentos": agendados,
        "atendimentos_imediatos": imediatos,
        "score_medio": avg_score,
        "score_maximo": max_score,
    }


# -------------------- Lead Warehouse (nutrição) --------------------

class WarehouseSignalCreate(BaseModel):
    """Payload público enviado quando o lead diz 'me avise quando lançar...'."""
    model_config = ConfigDict(extra="ignore")
    lead_id: Optional[str] = None  # se já existe lead na sessão, atualiza ele
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    nutricao: NutricaoWarehouse


@api_router.post("/leads/nutricao", response_model=Lead)
async def capture_warehouse_signal(payload: WarehouseSignalCreate):
    """Cria ou atualiza um lead com o sinal de nutrição (Lead Warehouse).

    - Se `lead_id` for fornecido e existir, faz update do campo nutricao_warehouse.
    - Caso contrário, cria um lead novo com status='novo' e o sinal já anexado.
    Em ambos os casos, lead ganha tag 'nutricao' em status_history para o admin
    poder rastrear como entrou.
    """
    now = datetime.now(timezone.utc)
    nutricao_dict = payload.nutricao.model_dump()
    nutricao_dict["captured_at"] = nutricao_dict["captured_at"].isoformat()

    if payload.lead_id:
        existing = await db.leads.find_one({"id": payload.lead_id}, {"_id": 0})
        if existing:
            update = {"nutricao_warehouse": nutricao_dict, "updated_at": now.isoformat()}
            # Mantém o nome/phone se vieram (pode ser um lead da sessão sem dados)
            if payload.name and not existing.get("name"):
                update["name"] = payload.name.strip()
            if payload.phone and not existing.get("phone"):
                update["phone"] = payload.phone.strip()
            if payload.email and not existing.get("email"):
                update["email"] = payload.email.strip()
            await db.leads.update_one(
                {"id": payload.lead_id},
                {
                    "$set": update,
                    "$push": {
                        "status_history": {
                            "from": existing.get("status", "novo"),
                            "to": existing.get("status", "novo"),
                            "tag": "nutricao_capturada",
                            "by": "system",
                            "at": now.isoformat(),
                        }
                    },
                },
            )
            updated = await db.leads.find_one({"id": payload.lead_id}, {"_id": 0})
            for k in ("created_at", "updated_at"):
                if isinstance(updated.get(k), str):
                    try:
                        updated[k] = datetime.fromisoformat(updated[k])
                    except Exception:
                        pass
            return updated

    # Lead novo (não tinha sessão ou lead_id não existe mais)
    lead = Lead(
        name=(payload.name or "").strip() or None,
        phone=(payload.phone or "").strip() or None,
        email=(payload.email or "").strip() or None,
        origem="warehouse_capture",
        nutricao_warehouse=payload.nutricao,
    )
    doc = lead.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    if doc.get("nutricao_warehouse") and isinstance(doc["nutricao_warehouse"].get("captured_at"), datetime):
        doc["nutricao_warehouse"]["captured_at"] = doc["nutricao_warehouse"]["captured_at"].isoformat()
    await db.leads.insert_one(doc)
    return lead


app.include_router(api_router)

# ---- Admin routes (protected by JWT) ----
from routers.admin import router as admin_router  # noqa: E402
from routers.brokers import router as brokers_router  # noqa: E402
api_router_admin = APIRouter(prefix="/api")
api_router_admin.include_router(admin_router)
api_router_admin.include_router(brokers_router)
app.include_router(api_router_admin)

# Expose db to admin routes via app.state
app.state.db = db

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def _on_startup():
    """Seed admin user and create MongoDB indexes (idempotent)."""
    from auth import seed_admin
    try:
        await seed_admin(db)
        await db.admin_users.create_index("email", unique=True)
        await db.login_attempts.create_index("identifier")
        await db.leads.create_index([("created_at", -1)])
        await db.leads.create_index("status")
        await db.leads.create_index("temperatura")
        await db.leads.create_index("owner_broker_id")
        await db.brokers.create_index("id", unique=True)
        await db.brokers.create_index("active")
        logger.info("Admin seeded + indexes ensured.")
    except Exception as exc:
        logger.exception("Startup init failed: %s", exc)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
