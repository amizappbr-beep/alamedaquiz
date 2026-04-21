"""Backend API tests for Alameda 500 quiz."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://alameda-quiz.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _answers_quente():
    return [
        {"question_id": "situacao", "question": "O que mais te motivaria hoje a buscar um imóvel?", "answer": "Sair do aluguel"},
        {"question_id": "desejo", "question": "O que não pode faltar na sua próxima casa?", "answer": "Quintal"},
        {"question_id": "tempo", "question": "Em quanto tempo você gostaria de mudar?", "answer": "O mais rápido possível"},
        {"question_id": "parcela", "question": "Qual faixa de parcela faria sentido pra você hoje?", "answer": "Acima de R$ 1.800"},
        {"question_id": "entrada", "question": "Sobre a entrada, qual sua realidade hoje?", "answer": "Já tenho parte do valor"},
        {"question_id": "decisao", "question": "Se fizer sentido, você avançaria na compra ainda este mês?", "answer": "Sim"},
    ]


# -------------------- Health --------------------
def test_root_ok(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert "Alameda" in data.get("message", "")


# -------------------- Leads CRUD --------------------
def test_create_lead_quente(client):
    payload = {
        "name": "TEST_Quente Lead",
        "phone": "(27) 99999-1111",
        "answers": _answers_quente(),
        "classification": "quente",
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] == "TEST_Quente Lead"
    assert data["phone"] == "(27) 99999-1111"
    assert data["classification"] == "quente"
    assert len(data["answers"]) == 6
    assert "id" in data and isinstance(data["id"], str)
    assert "_id" not in data


def test_create_lead_morno_frio(client):
    for cls in ["morno", "frio"]:
        payload = {
            "name": f"TEST_{cls}",
            "phone": "27988887777",
            "answers": _answers_quente(),
            "classification": cls,
        }
        r = client.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text
        assert r.json()["classification"] == cls


def test_create_lead_invalid_classification(client):
    payload = {
        "name": "TEST_Invalid",
        "phone": "27999990000",
        "answers": _answers_quente(),
        "classification": "super-quente",
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 422


def test_create_lead_missing_answers(client):
    payload = {
        "name": "TEST_FewAnswers",
        "phone": "27999990000",
        "answers": _answers_quente()[:3],
        "classification": "quente",
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 400
    assert "6 respostas" in r.json().get("detail", "")


def test_create_lead_empty_name(client):
    payload = {
        "name": "   ",
        "phone": "27999990000",
        "answers": _answers_quente(),
        "classification": "quente",
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 400


def test_create_lead_empty_phone(client):
    payload = {
        "name": "TEST_NoPhone",
        "phone": "",
        "answers": _answers_quente(),
        "classification": "quente",
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 400


def test_list_leads_excludes_objectid_and_sorted(client):
    # Ensure at least one exists
    client.post(f"{API}/leads", json={
        "name": "TEST_List",
        "phone": "27911112222",
        "answers": _answers_quente(),
        "classification": "quente",
    })
    r = client.get(f"{API}/leads")
    assert r.status_code == 200
    leads = r.json()
    assert isinstance(leads, list)
    assert len(leads) >= 1
    for lead in leads:
        assert "_id" not in lead
        assert "id" in lead
        assert "classification" in lead
        assert "created_at" in lead
    # Verify desc order by created_at
    timestamps = [l["created_at"] for l in leads]
    assert timestamps == sorted(timestamps, reverse=True)


def test_leads_summary(client):
    r = client.get(f"{API}/leads/summary")
    assert r.status_code == 200
    data = r.json()
    for k in ["total", "quente", "morno", "frio"]:
        assert k in data
        assert isinstance(data[k], int)
    assert data["total"] >= data["quente"] + data["morno"] + data["frio"] - 0  # at least sum
    assert data["quente"] + data["morno"] + data["frio"] <= data["total"]
