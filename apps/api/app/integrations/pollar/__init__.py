from dataclasses import dataclass
from typing import Literal

from app.core.config import Settings


@dataclass(frozen=True)
class PollarIntegrationState:
    """Configuration status only. No SDK client or external requests in Phase 0."""

    enabled: bool
    credentials_present: bool
    status: Literal["disabled", "not_configured", "pending_implementation"]


def get_integration_state(settings: Settings) -> PollarIntegrationState:
    configured = bool(settings.pollar_secret_key.get_secret_value())
    status = (
        "disabled"
        if not settings.pollar_enabled
        else "pending_implementation"
        if configured
        else "not_configured"
    )
    return PollarIntegrationState(settings.pollar_enabled, configured, status)
