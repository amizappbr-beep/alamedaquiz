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
def test_root_v21(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert data.get("version") == "2.1"
    assert "Alameda" in data.get("message", "")


# -------------------- Unidades (v2.1) --------------------
def test_get_unidades(client):
    r = client.get(f"{API}/unidades")
    assert r.status_code == 200
    data = r.json()
    assert "unidades" in data and "resumo" in data and "condicoes" in data
    assert len(data["unidades"]) == 12
    resumo = data["resumo"]
    assert resumo == {"total": 12, "disponivel": 7, "reservada": 3, "vendida": 2}
    cond = data["condicoes"]
    for k in ("pct_sinal", "pct_ate_chaves", "pct_financiado", "meses_obra", "residual_max", "residual_meses"):
        assert k in cond
    # status set
    statuses = {u["status"] for u in data["unidades"]}
    assert statuses == {"disponivel", "reservada", "vendida"}


# -------------------- Simulacao (v2.1) --------------------
def test_simulacao_unidade7_low_renda_reprovado(client):
    payload = {
        "unidade_numero": 7,
        "renda_bruta": 6500,
        "entrada": 50000,
        "fgts": 40000,
        "prazo_meses": 360,
        "parcelas_sinal": 3,
    }
    r = client.post(f"{API}/simulacao", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["aprovado"] is False
    assert data["faixa"]["nome"] == "Faixa 3"
    # Casa Família 6/7 = 380.000 → sinal 13% = 49.400
    assert data["sinal_total"] == 49400.0
    assert "valor_financiado" in data
    assert "parcela_bancaria" in data
    assert isinstance(data["razoes"], list)
    assert len(data["razoes"]) >= 1
    # parcela ~ 2025 > 1950 (30% of 6500) → razão deve mencionar 30%
    assert data["parcela_bancaria"] > data["limite_comprometimento"]
    assert data["valor_imovel"] == 380000


def test_simulacao_unidade7_high_renda_aprovado(client):
    payload = {
        "unidade_numero": 7,
        "renda_bruta": 12000,
        "entrada": 80000,
        "fgts": 50000,
        "prazo_meses": 360,
        "parcelas_sinal": 3,
    }
    r = client.post(f"{API}/simulacao", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["aprovado"] is True
    # SBPE faixa (renda > 8600)
    assert data["faixa"]["nome"] == "SBPE"
    assert data["aprovado_capacidade"] is True
    assert data["cobre_ate_chaves"] is True
    assert data["valor_financiado"] > 0
    assert data["razoes"] == []


def test_simulacao_unidade_vendida_409(client):
    payload = {"unidade_numero": 12, "renda_bruta": 10000, "entrada": 80000, "fgts": 50000}
    r = client.post(f"{API}/simulacao", json=payload)
    assert r.status_code == 409
    assert "vendida" in r.text.lower()


def test_simulacao_unidade_reservada_409(client):
    payload = {"unidade_numero": 6, "renda_bruta": 10000, "entrada": 80000, "fgts": 50000}
    r = client.post(f"{API}/simulacao", json=payload)
    assert r.status_code == 409


def test_simulacao_unidade_inexistente_404(client):
    payload = {"unidade_numero": 999, "renda_bruta": 10000, "entrada": 80000, "fgts": 50000}
    r = client.post(f"{API}/simulacao", json=payload)
    assert r.status_code == 404


def test_simulacao_sem_unidade_nem_modelo_400(client):
    payload = {"renda_bruta": 10000, "entrada": 80000, "fgts": 50000}
    r = client.post(f"{API}/simulacao", json=payload)
    assert r.status_code == 400


def test_simulacao_modelo_id_funciona(client):
    payload = {"modelo_id": "6_7", "renda_bruta": 12000, "entrada": 80000, "fgts": 50000}
    r = client.post(f"{API}/simulacao", json=payload)
    assert r.status_code == 200
    assert r.json()["valor_imovel"] == 380000


def test_simulacao_residual(client):
    payload = {
        "unidade_numero": 7, "renda_bruta": 12000, "entrada": 80000, "fgts": 50000,
        "usar_residual_pos_chaves": True,
    }
    r = client.post(f"{API}/simulacao", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["residual"] > 0
    assert data["parcela_residual"] > 0


# -------------------- Lead com simulação expandida (compat v2.1) --------------------
def test_create_lead_with_expanded_simulacao(client):
    payload = {
        "name": "TEST_SimExpanded",
        "phone": "27955554444",
        "modulos_visitados": ["empreendimento", "casas", "simulador"],
        "casa_preferida": "6_7",
        "simulacao": {
            "renda_bruta": 12000,
            "entrada": 80000,
            "fgts": 50000,
            "prazo_meses": 360,
            "parcela_estimada": 2200,
            "faixa_mcmv": "SBPE",
            "unidade_numero": 7,
            "valor_imovel": 380000,
            "sinal_total": 49400,
            "valor_financiado": 144000,
            "aprovado": True,
        },
        "solicita_atendimento_imediato": True,
        "tempo_total_segundos": 120,
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["simulacao"]["unidade_numero"] == 7
    assert data["simulacao"]["aprovado"] is True
    assert data["simulacao"]["valor_imovel"] == 380000


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
