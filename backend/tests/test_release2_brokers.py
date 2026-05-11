"""Release 2 backend tests — Brokers CRUD, round-robin auto-assign,
manual owner assignment, SLA/metrics fields, and filters.
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://alameda-quiz.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@alameda500.com"
ADMIN_PASSWORD = "vILabMQvT59VB-8NW7IclIu4"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=15,
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def clean_brokers(auth_headers):
    """Delete pre-existing TEST_ brokers (idempotent)."""
    r = requests.get(f"{BASE_URL}/api/admin/brokers", headers=auth_headers, timeout=15)
    if r.status_code == 200:
        for b in r.json():
            if b.get("name", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/admin/brokers/{b['id']}", headers=auth_headers)
    yield


# ============ Brokers CRUD ============

class TestBrokersCRUD:
    def test_create_broker(self, auth_headers, clean_brokers):
        r = requests.post(
            f"{BASE_URL}/api/admin/brokers",
            headers=auth_headers,
            json={"name": "TEST_Ana Round", "phone": "27999990001", "channel": "direto"},
            timeout=15,
        )
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["name"] == "TEST_Ana Round"
        assert data["active"] is True
        assert data["leads_count"] == 0
        assert "id" in data
        pytest.broker_a = data["id"]

    def test_create_second_broker(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/brokers",
            headers=auth_headers,
            json={"name": "TEST_Bruno Round", "channel": "direto"},
            timeout=15,
        )
        assert r.status_code == 201, r.text
        pytest.broker_b = r.json()["id"]

    def test_list_brokers_contains_new(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/brokers", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        ids = {b["id"] for b in r.json()}
        assert pytest.broker_a in ids
        assert pytest.broker_b in ids
        # ensure no _id leak
        for b in r.json():
            assert "_id" not in b

    def test_patch_toggle_active(self, auth_headers):
        r = requests.patch(
            f"{BASE_URL}/api/admin/brokers/{pytest.broker_a}",
            headers=auth_headers,
            json={"active": False},
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json()["active"] is False
        # restore
        r2 = requests.patch(
            f"{BASE_URL}/api/admin/brokers/{pytest.broker_a}",
            headers=auth_headers,
            json={"active": True},
            timeout=15,
        )
        assert r2.json()["active"] is True


# ============ Round-robin auto-assign ============

class TestRoundRobinAutoAssign:
    def _post_hot_lead(self, idx):
        return requests.post(
            f"{BASE_URL}/api/leads",
            json={
                "name": f"TEST_Hot {idx}",
                "phone": f"2799999{1000+idx:04d}",
                "solicita_atendimento_imediato": True,
                "modulos_visitados": ["empreendimento"],
            },
            timeout=15,
        )

    def _post_cold_lead(self, idx):
        return requests.post(
            f"{BASE_URL}/api/leads",
            json={
                "name": f"TEST_Cold {idx}",
                "phone": f"2798888{1000+idx:04d}",
                "modulos_visitados": ["empreendimento"],
                "solicita_atendimento_imediato": False,
            },
            timeout=15,
        )

    def test_only_test_brokers_active(self, auth_headers):
        """Deactivate non-TEST brokers so round-robin only picks our pair."""
        r = requests.get(f"{BASE_URL}/api/admin/brokers", headers=auth_headers, timeout=15)
        self._restore = []
        for b in r.json():
            if not b["name"].startswith("TEST_") and b.get("active"):
                requests.patch(
                    f"{BASE_URL}/api/admin/brokers/{b['id']}",
                    headers=auth_headers,
                    json={"active": False},
                )
                self._restore.append(b["id"])
        pytest.restore_active = self._restore

    def test_hot_lead_auto_assigns(self, auth_headers):
        # Recount first so leads_count is fresh
        requests.post(f"{BASE_URL}/api/admin/brokers/recount", headers=auth_headers, timeout=15)

        ids = []
        for i in range(4):
            r = self._post_hot_lead(i)
            assert r.status_code == 200, r.text
            data = r.json()
            assert data["owner_broker_id"] in (pytest.broker_a, pytest.broker_b), \
                f"hot lead {i} not auto-assigned: {data.get('owner_broker_id')}"
            assert data["owner_broker_name"] is not None
            # temperatura depends on score; auto-assign triggers on the
            # solicita_atendimento_imediato flag regardless. Validating
            # the owner_broker_id is enough.
            ids.append((data["id"], data["owner_broker_id"]))
        pytest.hot_lead_ids = [x[0] for x in ids]

        # Check distribution: round-robin should split 2-2
        counts = {pytest.broker_a: 0, pytest.broker_b: 0}
        for _, oid in ids:
            counts[oid] += 1
        assert counts[pytest.broker_a] >= 1 and counts[pytest.broker_b] >= 1, \
            f"distribution skewed: {counts}"

    def test_broker_counts_incremented(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/brokers", headers=auth_headers, timeout=15)
        by_id = {b["id"]: b for b in r.json()}
        total = by_id[pytest.broker_a]["leads_count"] + by_id[pytest.broker_b]["leads_count"]
        assert total >= 4, f"counts didn't increment after 4 hot leads: {total}"

    def test_cold_lead_NOT_auto_assigned(self, auth_headers):
        r = self._post_cold_lead(99)
        assert r.status_code == 200
        data = r.json()
        assert data["owner_broker_id"] is None, "cold lead should not auto-assign"
        assert data["owner_broker_name"] is None
        pytest.cold_lead_id = data["id"]


# ============ Manual owner assignment ============

class TestManualOwnerAssignment:
    def test_assign_owner_to_cold_lead(self, auth_headers):
        # cold lead from previous test
        # Get count before
        r0 = requests.get(f"{BASE_URL}/api/admin/brokers", headers=auth_headers, timeout=15)
        before = {b["id"]: b["leads_count"] for b in r0.json()}

        r = requests.patch(
            f"{BASE_URL}/api/admin/leads/{pytest.cold_lead_id}/owner",
            headers=auth_headers,
            json={"broker_id": pytest.broker_a},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        assert r.json()["owner_broker_id"] == pytest.broker_a

        r1 = requests.get(f"{BASE_URL}/api/admin/brokers", headers=auth_headers, timeout=15)
        after = {b["id"]: b["leads_count"] for b in r1.json()}
        assert after[pytest.broker_a] == before[pytest.broker_a] + 1

    def test_reassign_owner_swap_counts(self, auth_headers):
        r0 = requests.get(f"{BASE_URL}/api/admin/brokers", headers=auth_headers, timeout=15)
        before = {b["id"]: b["leads_count"] for b in r0.json()}

        r = requests.patch(
            f"{BASE_URL}/api/admin/leads/{pytest.cold_lead_id}/owner",
            headers=auth_headers,
            json={"broker_id": pytest.broker_b},
            timeout=15,
        )
        assert r.status_code == 200

        r1 = requests.get(f"{BASE_URL}/api/admin/brokers", headers=auth_headers, timeout=15)
        after = {b["id"]: b["leads_count"] for b in r1.json()}
        assert after[pytest.broker_a] == before[pytest.broker_a] - 1
        assert after[pytest.broker_b] == before[pytest.broker_b] + 1

    def test_unassign_owner(self, auth_headers):
        r0 = requests.get(f"{BASE_URL}/api/admin/brokers", headers=auth_headers, timeout=15)
        before = {b["id"]: b["leads_count"] for b in r0.json()}

        r = requests.patch(
            f"{BASE_URL}/api/admin/leads/{pytest.cold_lead_id}/owner",
            headers=auth_headers,
            json={"broker_id": None},
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json()["owner_broker_id"] is None

        r1 = requests.get(f"{BASE_URL}/api/admin/brokers", headers=auth_headers, timeout=15)
        after = {b["id"]: b["leads_count"] for b in r1.json()}
        assert after[pytest.broker_b] == before[pytest.broker_b] - 1

    def test_counts_never_negative(self, auth_headers):
        # Try to unassign again (already None)
        r = requests.patch(
            f"{BASE_URL}/api/admin/leads/{pytest.cold_lead_id}/owner",
            headers=auth_headers,
            json={"broker_id": None},
            timeout=15,
        )
        assert r.status_code == 200
        r1 = requests.get(f"{BASE_URL}/api/admin/brokers", headers=auth_headers, timeout=15)
        for b in r1.json():
            assert b["leads_count"] >= 0, f"negative count: {b}"


# ============ Metrics fields ============

class TestMetricsRelease2:
    def test_metrics_has_new_fields(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/metrics", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        for key in ("sla_atrasados", "brokers_ativos", "leads_sem_dono"):
            assert key in data, f"missing key {key} in metrics"
            assert isinstance(data[key], int), f"{key} not int: {type(data[key])}"
        assert data["brokers_ativos"] >= 2, "should have at least 2 active brokers"


# ============ Filters ============

class TestLeadFilters:
    def test_filter_by_owner(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/admin/leads?owner={pytest.broker_a}",
            headers=auth_headers, timeout=15,
        )
        assert r.status_code == 200
        for lead in r.json():
            assert lead.get("owner_broker_id") == pytest.broker_a

    def test_filter_unassigned(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/admin/leads?owner=unassigned",
            headers=auth_headers, timeout=15,
        )
        assert r.status_code == 200
        for lead in r.json():
            assert lead.get("owner_broker_id") is None

    def test_filter_by_channel(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/admin/leads?channel=direto",
            headers=auth_headers, timeout=15,
        )
        assert r.status_code == 200
        for lead in r.json():
            assert lead.get("channel") == "direto"


# ============ Delete broker unassigns leads ============

class TestDeleteBrokerCleanup:
    def test_delete_broker_unassigns(self, auth_headers):
        # Create disposable broker
        cr = requests.post(
            f"{BASE_URL}/api/admin/brokers",
            headers=auth_headers,
            json={"name": "TEST_Disposable", "channel": "direto"},
            timeout=15,
        )
        assert cr.status_code == 201
        disposable = cr.json()["id"]

        # Assign cold lead to it
        requests.patch(
            f"{BASE_URL}/api/admin/leads/{pytest.cold_lead_id}/owner",
            headers=auth_headers, json={"broker_id": disposable}, timeout=15,
        )
        # Delete broker
        dr = requests.delete(f"{BASE_URL}/api/admin/brokers/{disposable}", headers=auth_headers, timeout=15)
        assert dr.status_code == 200

        # Lead should be unassigned
        lr = requests.get(
            f"{BASE_URL}/api/admin/leads/{pytest.cold_lead_id}",
            headers=auth_headers, timeout=15,
        )
        assert lr.status_code == 200
        assert lr.json()["owner_broker_id"] is None


# ============ Teardown: restore deactivated brokers ============

def teardown_module(_):
    """Restore non-test brokers that were deactivated, and remove TEST_ brokers."""
    try:
        token = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=15,
        ).json().get("access_token")
        if not token:
            return
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        for bid in getattr(pytest, "restore_active", []) or []:
            requests.patch(f"{BASE_URL}/api/admin/brokers/{bid}", headers=headers,
                           json={"active": True}, timeout=10)
        r = requests.get(f"{BASE_URL}/api/admin/brokers", headers=headers, timeout=10)
        for b in r.json():
            if b["name"].startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/admin/brokers/{b['id']}", headers=headers, timeout=10)
    except Exception as e:
        print(f"teardown error: {e}")
