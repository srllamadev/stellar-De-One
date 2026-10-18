from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker

from app.api.v1.router import router
from app.core.config import Settings, get_settings
from app.core.database import create_database_engine


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        engine = create_database_engine(settings)
        application.state.session_factory = sessionmaker(bind=engine, expire_on_commit=False)
        try:
            yield
        finally:
            engine.dispose()

    application = FastAPI(
        title="Remesas LATAM API",
        version="0.1.0",
        lifespan=lifespan,
        description="Fase 0. Sin operaciones financieras. Exclusivamente Stellar Testnet.",
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[str(settings.frontend_url).rstrip("/")],
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["Content-Type"],
    )
    application.include_router(router)
    return application


app = create_app()
