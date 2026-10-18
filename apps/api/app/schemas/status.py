from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: Literal["remesas-api"] = "remesas-api"
    version: Literal["0.1.0"] = "0.1.0"


class ReadyResponse(BaseModel):
    status: Literal["ready", "not_ready"]
    database: Literal["up", "down"]
