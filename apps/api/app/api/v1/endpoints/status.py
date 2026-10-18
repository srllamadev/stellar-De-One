from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.status import HealthResponse, ReadyResponse

router = APIRouter(tags=["status"])


@router.get("/health", response_model=HealthResponse, summary="Proceso API disponible")
def health() -> HealthResponse:
    return HealthResponse()


@router.get(
    "/ready",
    response_model=ReadyResponse,
    responses={503: {"model": ReadyResponse, "description": "PostgreSQL no disponible"}},
    summary="Conectividad PostgreSQL mediante SELECT 1",
)
def ready(db: Annotated[Session, Depends(get_db)]) -> ReadyResponse | JSONResponse:
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        # Never expose connection strings or database errors to the client.
        response = ReadyResponse(status="not_ready", database="down")
        return JSONResponse(status_code=503, content=response.model_dump())
    return ReadyResponse(status="ready", database="up")
