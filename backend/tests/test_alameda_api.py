"""Backend API tests for Alameda 500 — v2 (HUB de Exploração)."""
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _quiz_answers():
    return [
        {"question_id": "q1", "question": "Q1", "answer": "A1"},
        {"question_id": "q2", "question": "Q2", "answer": "A2"},
        {"question_id": "q3", "question": "Q3", "answer": "A3"},
        {"question_id": "q4", "question": "Q4", "answer": "A4"},
        {"question_id": "q5", "question": "Q5", "answer": "A5"},
        {"question_id": "q6", "question": "Q6", "answer": "A6"},
    ]


# -------------------- Health --------------------
def test_root_v2(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert data.get("version") == "2.0"
    assert "Alameda" in data.get("message", "")


# -------------------- Lead drafts (no name/phone) --------------------
def test_create_lead_draft_no_name_phone(client):
    """Rascunho: só módulos visitados, sem agendamento/imediato → 200."""
    payload = {"modulos_visitados": ["empreendimento", "casas"]}
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] is None
    assert data["phone"] is None
    assert data["modulos_visitados"] == ["empreendimento", "casas"]
    # Score = 10 (empreendimento). casa_preferida missing → no +15
    assert data["lead_score"] == 10
    assert data["temperatura"] == "frio"


# -------------------- Validation: finalizing requires name+phone --------------------
def test_create_lead_imediato_missing_name(client):
    payload = {
        "phone": "(27) 99999-1111",
        "solicita_atendimento_imediato": True,
        "modulos_visitados": ["empreendimento"],
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 400


def test_create_lead_imediato_missing_phone(client):
    payload = {
        "name": "TEST_NoPhone",
        "solicita_atendimento_imediato": True,
        "modulos_visitados": ["empreendimento"],
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 400


def test_create_lead_agendamento_missing_name_phone(client):
    payload = {
        "agendamento": {"data": "2026-02-10", "horario": "15:00", "formato": "decorado"},
        "modulos_visitados": ["empreendimento"],
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 400


# -------------------- Score scenarios --------------------
def test_create_lead_full_agendamento_score_125(client):
    """4 módulos + quiz quente + casa + agendamento + 180s = 10+15+30+40+30 = 125 (quente)."""
    payload = {
        "name": "TEST_Agendamento",
        "phone": "(27) 99999-2222",
        "modulos_visitados": ["empreendimento", "casas", "perfil", "diferenciais"],
        "quiz_answers": _quiz_answers(),
        "classification": "quente",
        "casa_preferida": "1_12",
        "agendamento": {"data": "2026-02-10", "horario": "15:00", "formato": "decorado"},
        "tempo_total_segundos": 180,
        "interacoes": [{"tipo": "click", "modulo": "casas"}],
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    # 10 (emp) + 15 (casas+casa_pref) + 5 (diferenciais) + 30 (perfil+quente) + 40 (agend) + 30 (180s = 6*5=30 capped at 20 actually)
    # tempo: 180//30 = 6, *5 = 30, min(20, 30) = 20
    # so 10+15+5+30+40+20 = 120
    assert data["lead_score"] == 120
    assert data["temperatura"] == "quente"
    assert data["agendamento"]["formato"] == "decorado"
    assert "_id" not in data


def test_create_lead_full_imediato_score(client):
    """imediato instead of agendamento: 10+15+5+30+50+20 = 130 (cap 150)."""
    payload = {
        "name": "TEST_Imediato",
        "phone": "(27) 99999-3333",
        "modulos_visitados": ["empreendimento", "casas", "perfil", "diferenciais"],
        "quiz_answers": _quiz_answers(),
        "classification": "quente",
        "casa_preferida": "6_7",
        "solicita_atendimento_imediato": True,
        "tempo_total_segundos": 180,
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["lead_score"] == 130
    assert data["temperatura"] == "quente"
    assert data["solicita_atendimento_imediato"] is True


def test_create_lead_score_cap_150(client):
    """Even with high inputs, score capped at 150."""
    payload = {
        "name": "TEST_Cap",
        "phone": "27999990000",
        "modulos_visitados": ["empreendimento", "casas", "perfil", "diferenciais", "simulador"],
        "quiz_answers": _quiz_answers(),
        "classification": "quente",
        "casa_preferida": "2_a_11",
        "simulacao": {"renda_bruta": 5000, "entrada": 20000, "prazo_meses": 360, "parcela_estimada": 1500},
        "agendamento": {"data": "2026-02-10", "horario": "10:00", "formato": "imovel"},
        "solicita_atendimento_imediato": True,
        "tempo_total_segundos": 600,
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 200, r.text
    assert r.json()["lead_score"] == 150


# -------------------- List + persistence --------------------
def test_list_leads_no_objectid_sorted(client):
    # ensure at least one
    client.post(f"{API}/leads", json={"modulos_visitados": ["empreendimento"]})
    r = client.get(f"{API}/leads")
    assert r.status_code == 200
    leads = r.json()
    assert isinstance(leads, list)
    assert len(leads) >= 1
    for lead in leads:
        assert "_id" not in lead
        assert "id" in lead
        assert "lead_score" in lead
        assert "temperatura" in lead
    timestamps = [l["created_at"] for l in leads if l.get("created_at")]
    assert timestamps == sorted(timestamps, reverse=True)


def test_list_leads_query_params(client):
    # Seed a quente lead
    client.post(f"{API}/leads", json={
        "name": "TEST_Q",
        "phone": "27911110000",
        "modulos_visitados": ["empreendimento", "casas", "perfil"],
        "quiz_answers": _quiz_answers(),
        "classification": "quente",
        "casa_preferida": "1_12",
        "solicita_atendimento_imediato": True,
        "tempo_total_segundos": 120,
    })
    r = client.get(f"{API}/leads", params={"temperatura": "quente", "min_score": 50})
    assert r.status_code == 200
    leads = r.json()
    for l in leads:
        assert l.get("temperatura") == "quente"
        assert l.get("lead_score", 0) >= 50

    r2 = client.get(f"{API}/leads", params={"classification": "quente"})
    assert r2.status_code == 200
    for l in r2.json():
        assert l.get("classification") == "quente"


def test_create_then_list_persistence(client):
    payload = {
        "name": "TEST_Persist",
        "phone": "27900001111",
        "modulos_visitados": ["empreendimento", "casas"],
        "casa_preferida": "1_12",
        "solicita_atendimento_imediato": True,
        "tempo_total_segundos": 60,
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 200
    new_id = r.json()["id"]
    # GET list and find it
    r2 = client.get(f"{API}/leads")
    ids = [l["id"] for l in r2.json()]
    assert new_id in ids


# -------------------- Summary --------------------
def test_leads_summary_v2(client):
    r = client.get(f"{API}/leads/summary")
    assert r.status_code == 200
    data = r.json()
    assert "total" in data and isinstance(data["total"], int)
    assert "temperatura" in data
    for k in ("quente", "morno", "frio"):
        assert k in data["temperatura"]
        assert isinstance(data["temperatura"][k], int)
    assert "agendamentos" in data
    assert "atendimentos_imediatos" in data
    assert "score_medio" in data
    assert "score_maximo" in data
