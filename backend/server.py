from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Literal, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Alameda 500 — Quiz API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# -------------------- Models --------------------
class QuizAnswer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    question_id: str
    question: str
    answer: str


class LeadCreate(BaseModel):
    name: str
    phone: str
    answers: List[QuizAnswer]
    classification: Literal["quente", "morno", "frio"]


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    answers: List[QuizAnswer]
    classification: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -------------------- Routes --------------------
@api_router.get("/")
async def root():
    return {"message": "Alameda 500 API — online", "status": "ok"}


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    if not payload.name.strip() or not payload.phone.strip():
        raise HTTPException(status_code=400, detail="Nome e telefone são obrigatórios.")
    if len(payload.answers) != 6:
        raise HTTPException(status_code=400, detail="O quiz precisa ter 6 respostas.")

    lead = Lead(
        name=payload.name.strip(),
        phone=payload.phone.strip(),
        answers=payload.answers,
        classification=payload.classification,
    )

    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['answers'] = [a if isinstance(a, dict) else a.model_dump() for a in doc['answers']]

    await db.leads.insert_one(doc)
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads(limit: int = 200, classification: Optional[str] = None):
    query = {}
    if classification in {"quente", "morno", "frio"}:
        query["classification"] = classification

    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            try:
                lead['created_at'] = datetime.fromisoformat(lead['created_at'])
            except Exception:
                pass
    return leads


@api_router.get("/leads/summary")
async def leads_summary():
    total = await db.leads.count_documents({})
    quente = await db.leads.count_documents({"classification": "quente"})
    morno = await db.leads.count_documents({"classification": "morno"})
    frio = await db.leads.count_documents({"classification": "frio"})
    return {"total": total, "quente": quente, "morno": morno, "frio": frio}


# Include the router in the main app
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
