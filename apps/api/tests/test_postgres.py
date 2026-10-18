import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.core.config import Settings
from app.main import create_app


@pytest.mark.integration
def test_ready_real_postgres():
    url = os.environ.get("TEST_DATABASE_URL")
    if not url:
        pytest.skip("TEST_DATABASE_URL not configured; real PostgreSQL test not run")
    settings = Settings(_env_file=None, app_env="test", database_url=url)
    with TestClient(create_app(settings)) as client:
        response = client.get("/api/v1/ready")
        assert response.status_code == 200
        assert response.json() == {"status": "ready", "database": "up"}
    engine = create_engine(url)
    try:
        with engine.connect() as connection:
            assert connection.execute(text("SELECT version()")).scalar().startswith("PostgreSQL")
    finally:
        engine.dispose()
