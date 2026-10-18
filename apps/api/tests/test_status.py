from unittest.mock import Mock

from sqlalchemy.exc import OperationalError

from app.core.database import get_db


def test_health_contract(client):
    # A database dependency must never be invoked by liveness.
    def unavailable_db():
        raise AssertionError("health must not access PostgreSQL")

    client.app.dependency_overrides[get_db] = unavailable_db
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    assert response.json() == {"status": "ok", "service": "remesas-api", "version": "0.1.0"}


def test_ready_success_executes_select(client):
    session = Mock()
    client.app.dependency_overrides[get_db] = lambda: session
    response = client.get("/api/v1/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready", "database": "up"}
    assert str(session.execute.call_args.args[0]) == "SELECT 1"


def test_ready_failure_does_not_leak_connection_details(client):
    session = Mock()
    session.execute.side_effect = OperationalError("secret_connection", {}, Exception("password"))
    client.app.dependency_overrides[get_db] = lambda: session
    response = client.get("/api/v1/ready")
    assert response.status_code == 503
    assert response.json() == {"status": "not_ready", "database": "down"}
    assert "password" not in response.text


def test_docs_and_openapi(client):
    assert client.get("/docs").status_code == 200
    spec = client.get("/openapi.json").json()
    assert set(spec["paths"]) == {"/api/v1/health", "/api/v1/ready"}
    assert "503" in spec["paths"]["/api/v1/ready"]["get"]["responses"]


def test_cors_allows_frontend_only(client):
    allowed = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
    forbidden = client.get("/api/v1/health", headers={"Origin": "https://untrusted.example"})
    assert "access-control-allow-origin" not in forbidden.headers
