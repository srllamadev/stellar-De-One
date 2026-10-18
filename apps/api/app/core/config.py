from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import AnyHttpUrl, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: Literal["development", "test"] = "development"
    database_url: SecretStr = SecretStr(
        "postgresql+psycopg://remesas_local:local_dev_only_change_me@localhost:5433/remesas_latam"
    )
    frontend_url: AnyHttpUrl = AnyHttpUrl("http://localhost:3000")
    pollar_secret_key: SecretStr = SecretStr("")
    pollar_enabled: bool = False
    stellar_network: Literal["testnet"] = "testnet"

    @field_validator("database_url")
    @classmethod
    def require_postgres(cls, value: SecretStr) -> SecretStr:
        if make_url(value.get_secret_value()).drivername != "postgresql+psycopg":
            raise ValueError("DATABASE_URL debe usar postgresql+psycopg")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
