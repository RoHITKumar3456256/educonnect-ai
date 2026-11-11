import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["active_profiles"] >= 20

def test_get_profiles():
    response = client.get("/api/profiles?limit=5")
    assert response.status_code == 200
    profiles = response.json()
    assert len(profiles) > 0
    assert "name" in profiles[0]
    assert "role" in profiles[0]

def test_discovery_run():
    payload = {
        "reference_input_type": "text",
        "reference_text": "Looking for senior school principals and curriculum turnaround advisors with experience in CBSE and international schools.",
        "top_k": 5
    }
    response = client.post("/api/discovery/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "run_id" in data
    assert len(data["top_candidates"]) > 0
    first = data["top_candidates"][0]
    assert "scores" in first
    assert "final_score" in first["scores"]
    assert "explanation" in first

def test_profile_analyze():
    payload = {
        "raw_text": "Dr. Sunita Rao is a Senior Education Advisor at Green Valley Schools in Bengaluru with 18 years experience guiding 10 schools."
    }
    response = client.post("/api/profiles/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["extracted_profile"]["experience_years"] == 18
    assert "identified_evidence" in data

