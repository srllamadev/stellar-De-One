from collections.abc import Generator

from fastapi import Request
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings


def create_database_engine(settings: Settings) -> Engine:
    # Lazy connection: liveness remains available when PostgreSQL is down.
    return create_engine(
        settings.database_url.get_secret_value(),
        pool_pre_ping=True,
        pool_timeout=3,
        connect_args={"connect_timeout": 3},
    )


def get_db(request: Request) -> Generator[Session, None, None]:
    factory: sessionmaker[Session] = request.app.state.session_factory
    with factory() as session:
        yield session
