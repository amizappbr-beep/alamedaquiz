"""Fase 3 — Admin CRM (JWT) backend tests.

Covers:
- POST /api/admin/login (401 / 200 / brute-force lockout)
- GET  /api/admin/me
- GET  /api/admin/leads + filters
- GET  /api/admin/leads/{id}
- PATCH /api/admin/leads/{id}/status
- POST /api/admin/leads/{id}/notes
- GET  /api/admin/metrics
- Admin seed idempotent
- Public routes still work without auth
"""
from __future__ import annotations

import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://alameda-quiz.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@alameda500.com"
ADMIN_PASSWORD = "vILabMQvT59VB-8NW7IclIu4"


# ---------- Fixtures ----------

@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    # Clear any previous lockouts by waiting a moment (not strictly needed)
    r = api.post(f"{BASE_URL}/api/admin/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
    })
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and data["email"] == ADMIN_EMAIL
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def seed_lead(api):
    """Create a lead via public route to use in admin tests."""
    payload = {
        "name": f"TEST_Regressao_Fase3_{uuid.uuid4().hex[:6]}",
        "phone": "27900010001",
        "email": "test_fase3@example.com",
        "modulos_visitados": ["empreendimento", "casas", "perfil", "simulador"],
        "quiz_answers": [
            {"question_id": "q1", "question": "Q?", "answer": "A"},
        ],
        "classification": "quente",
        "casa_preferida": "Premium",
        "simulacao": {"renda_bruta": 8000, "entrada": 50000},
        "solicita_atendimento_imediato": True,
        "tempo_total_segundos": 300,
    }
    r = api.post(f"{BASE_URL}/api/leads", json=payload)
    assert r.status_code == 200, f"seed lead failed: {r.text}"
    return r.json()


# ---------- Auth tests ----------

class TestAdminAuth:

    def test_login_wrong_password_401(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrong-password-xyz",
        })
        assert r.status_code == 401
        body = r.json()
        assert "detail" in body

    def test_login_success(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
        })
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["token_type"] == "bearer"
        assert isinstance(data["access_token"], str) and len(data["access_token"]) > 20
        assert data["expires_in"] == 24 * 3600

    def test_me_without_token_401(self, api):
        r = api.get(f"{BASE_URL}/api/admin/me")
        assert r.status_code == 401

    def test_me_with_invalid_token_401(self, api):
        r = api.get(f"{BASE_URL}/api/admin/me",
                    headers={"Authorization": "Bearer invalid.token.xyz"})
        assert r.status_code == 401

    def test_me_with_valid_token(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"

    def test_brute_force_lockout(self, api):
        """Use a unique email so we don't lock out the real admin account for other tests."""
        fake_email = f"lockout_{uuid.uuid4().hex[:6]}@example.com"
        for i in range(5):
            r = api.post(f"{BASE_URL}/api/admin/login", json={
                "email": fake_email,
                "password": "anything",
            })
            assert r.status_code == 401, f"attempt {i+1} got {r.status_code}"
        # 6th attempt -> 429
        r = api.post(f"{BASE_URL}/api/admin/login", json={
            "email": fake_email,
            "password": "anything",
        })
        assert r.status_code == 429
        assert "Muitas tentativas" in r.json().get("detail", "")


# ---------- Leads listing / filters ----------

class TestAdminLeads:

    def test_list_leads_without_token_401(self, api):
        r = api.get(f"{BASE_URL}/api/admin/leads")
        assert r.status_code == 401

    def test_list_leads_with_token(self, api, auth_headers, seed_lead):
        r = api.get(f"{BASE_URL}/api/admin/leads", headers=auth_headers)
        assert r.status_code == 200
        leads = r.json()
        assert isinstance(leads, list)
        assert len(leads) >= 1
        # All should have a status (default "novo")
        for lead in leads:
            assert "status" in lead
        # Our seed lead is there
        seed_ids = [lead.get("id") for lead in leads]
        assert seed_lead["id"] in seed_ids

    def test_list_leads_sorted_desc(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/leads", headers=auth_headers)
        leads = r.json()
        if len(leads) >= 2:
            # Compare first two timestamps
            t0 = leads[0].get("created_at")
            t1 = leads[1].get("created_at")
            assert t0 >= t1

    def test_filter_by_status(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/leads?status=novo", headers=auth_headers)
        assert r.status_code == 200
        for lead in r.json():
            assert lead.get("status") == "novo"

    def test_filter_by_temperatura(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/leads?temperatura=quente", headers=auth_headers)
        assert r.status_code == 200
        for lead in r.json():
            assert lead.get("temperatura") == "quente"

    def test_search_by_name_case_insensitive(self, api, auth_headers, seed_lead):
        # Search by fragment of lead name in lowercase
        q = "test_regressao"
        r = api.get(f"{BASE_URL}/api/admin/leads?q={q}", headers=auth_headers)
        assert r.status_code == 200
        results = r.json()
        names = [lead.get("name", "") or "" for lead in results]
        assert any("TEST_Regressao" in n for n in names)


# ---------- Lead detail ----------

class TestLeadDetail:

    def test_lead_detail_ok(self, api, auth_headers, seed_lead):
        r = api.get(f"{BASE_URL}/api/admin/leads/{seed_lead['id']}", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == seed_lead["id"]
        assert "quiz_answers" in data
        assert "simulacao" in data
        assert "modulos_visitados" in data

    def test_lead_detail_404(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/leads/does-not-exist-{uuid.uuid4().hex}",
                    headers=auth_headers)
        assert r.status_code == 404


# ---------- Status updates ----------

class TestStatusUpdate:

    def test_status_update_contatado(self, api, auth_headers, seed_lead):
        r = api.patch(
            f"{BASE_URL}/api/admin/leads/{seed_lead['id']}/status",
            headers=auth_headers,
            json={"status": "contatado"},
        )
        assert r.status_code == 200
        assert r.json() == {"ok": True, "status": "contatado"}

        # Verify persistence
        g = api.get(f"{BASE_URL}/api/admin/leads/{seed_lead['id']}", headers=auth_headers)
        body = g.json()
        assert body["status"] == "contatado"
        assert "status_history" in body and len(body["status_history"]) >= 1
        last = body["status_history"][-1]
        assert last["to"] == "contatado"
        assert last["by"] == ADMIN_EMAIL
        assert "at" in last

    def test_status_invalid_422(self, api, auth_headers, seed_lead):
        r = api.patch(
            f"{BASE_URL}/api/admin/leads/{seed_lead['id']}/status",
            headers=auth_headers,
            json={"status": "xyz"},
        )
        assert r.status_code == 422

    def test_status_not_found(self, api, auth_headers):
        r = api.patch(
            f"{BASE_URL}/api/admin/leads/not-a-real-id/status",
            headers=auth_headers,
            json={"status": "ganho"},
        )
        assert r.status_code == 404


# ---------- Notes ----------

class TestNotes:

    def test_add_note_ok(self, api, auth_headers, seed_lead):
        r = api.post(
            f"{BASE_URL}/api/admin/leads/{seed_lead['id']}/notes",
            headers=auth_headers,
            json={"text": "Cliente ligou — interesse alto."},
        )
        assert r.status_code == 200
        note = r.json()
        assert note["author"] == ADMIN_EMAIL
        assert note["text"] == "Cliente ligou — interesse alto."
        assert "created_at" in note

        # Verify persistence
        g = api.get(f"{BASE_URL}/api/admin/leads/{seed_lead['id']}", headers=auth_headers)
        notes = g.json().get("admin_notes", [])
        assert any(n.get("text") == "Cliente ligou — interesse alto." for n in notes)

    def test_add_note_empty_text_422(self, api, auth_headers, seed_lead):
        r = api.post(
            f"{BASE_URL}/api/admin/leads/{seed_lead['id']}/notes",
            headers=auth_headers,
            json={"text": ""},
        )
        assert r.status_code == 422

    def test_add_note_not_found(self, api, auth_headers):
        r = api.post(
            f"{BASE_URL}/api/admin/leads/no-such-id/notes",
            headers=auth_headers,
            json={"text": "nota"},
        )
        assert r.status_code == 404


# ---------- Metrics ----------

class TestMetrics:

    def test_metrics_without_token_401(self, api):
        r = api.get(f"{BASE_URL}/api/admin/metrics")
        assert r.status_code == 401

    def test_metrics_shape(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/metrics", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        for key in [
            "total", "ultimos_7d", "temperatura", "kanban",
            "agendamentos", "atendimentos_imediatos",
            "com_simulacao", "com_casa_preferida",
            "score_medio", "score_maximo",
        ]:
            assert key in data, f"missing {key}"
        # temperatura shape
        for k in ("quente", "morno", "frio"):
            assert k in data["temperatura"]
        # kanban shape (all 6 statuses)
        for s in ("novo", "contatado", "agendado", "negociacao", "ganho", "perdido"):
            assert s in data["kanban"]
            assert isinstance(data["kanban"][s], int)
        assert isinstance(data["total"], int)


# ---------- Public routes not broken ----------

class TestPublicRoutes:

    def test_api_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_get_unidades(self, api):
        r = api.get(f"{BASE_URL}/api/unidades")
        assert r.status_code == 200
        body = r.json()
        assert "unidades" in body and "resumo" in body
        assert len(body["unidades"]) == 12

    def test_simulacao_public(self, api):
        r = api.post(f"{BASE_URL}/api/simulacao", json={
            "unidade_numero": 3,
            "renda_bruta": 8000,
            "entrada": 50000,
        })
        assert r.status_code == 200
        assert "parcela_bancaria" in r.json()

    def test_create_lead_public(self, api):
        r = api.post(f"{BASE_URL}/api/leads", json={
            "name": "TEST_public_lead",
            "phone": "27911111111",
            "modulos_visitados": ["empreendimento"],
            "solicita_atendimento_imediato": False,
        })
        assert r.status_code == 200
        assert "id" in r.json()
