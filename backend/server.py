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
    data: str  # ISO date yyyy-mm-dd
    horario: str  # HH:mm
    formato: Literal["decorado", "imovel", "videochamada"]
    observacao: Optional[str] = None


class Simulacao(BaseModel):
    model_config = ConfigDict(extra="ignore")
    renda_bruta: Optional[float] = None
    entrada: Optional[float] = None
    fgts: Optional[float] = None
    prazo_meses: Optional[int] = None
    parcela_estimada: Optional[float] = None
    faixa_mcmv: Optional[str] = None


class Interacao(BaseModel):
    model_config = ConfigDict(extra="ignore")
    tipo: str
    modulo: Optional[str] = None
    detalhe: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LeadCreate(BaseModel):
    # Identificação (pode estar vazia em rascunho)
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    # Jornada
    modulos_visitados: List[str] = Field(default_factory=list)
    quiz_answers: List[QuizAnswer] = Field(default_factory=list)
    classification: Optional[Literal["quente", "morno", "frio"]] = None
    casa_preferida: Optional[str] = None  # id do modelo: 1_12 | 6_7 | 2_a_11
    simulacao: Optional[Simulacao] = None
    agendamento: Optional[Agendamento] = None
    solicita_atendimento_imediato: bool = False
    interacoes: List[Interacao] = Field(default_factory=list)
    tempo_total_segundos: int = 0
    origem: Optional[str] = None  # utm_source etc.


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
    temperatura: str = "frio"  # quente | morno | frio
    origem: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -------------------- Business logic --------------------
def compute_lead_score(payload: LeadCreate) -> int:
    """
    Pontuação 0–175 (cap em 150 para exibição).
    Pondera engajamento + qualificação.
    """
    score = 0
    mods = set(payload.modulos_visitados)

    # Engajamento por módulo
    if "empreendimento" in mods:
        score += 10
    if "casas" in mods and payload.casa_preferida:
        score += 15
    if "diferenciais" in mods:
        score += 5

    # Quiz de perfil (classificação)
    if "perfil" in mods and len(payload.quiz_answers) >= 6:
        if payload.classification == "quente":
            score += 30
        elif payload.classification == "morno":
            score += 20
        else:
            score += 10

    # Simulador
    if "simulador" in mods and payload.simulacao and payload.simulacao.renda_bruta:
        score += 25

    # Intenção de compra (maior peso)
    if payload.agendamento:
        score += 40
    if payload.solicita_atendimento_imediato:
        score += 50

    # Tempo na página (5 pontos a cada 30s, máx 20)
    tempo_pts = min(20, (payload.tempo_total_segundos // 30) * 5)
    score += tempo_pts

    return min(150, score)


def compute_temperature(score: int) -> str:
    if score >= 90:
        return "quente"
    if score >= 45:
        return "morno"
    return "frio"


# -------------------- Routes --------------------
@api_router.get("/")
async def root():
    return {"message": "Alameda 500 — Concierge Digital API", "status": "ok", "version": "2.0"}


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    # Validação mínima: para leads "finalizados" exigimos nome + phone
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
        modulos_visitados=list(dict.fromkeys(payload.modulos_visitados)),  # dedup mantendo ordem
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
    )

    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    # Normalise nested datetimes
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


# Include router
app.include_router(api_router)

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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
