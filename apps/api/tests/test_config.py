import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.integrations.pollar import get_integration_state


def test_defaults_are_testnet_and_disabled():
    settings = Settings(_env_file=None)
    assert settings.stellar_network == "testnet"
    assert settings.pollar_enabled is False
    assert get_integration_state(settings).status == "disabled"
    assert "local_dev_only" not in repr(settings)


def test_pollar_missing_credentials_is_nonfatal():
    settings = Settings(_env_file=None, pollar_enabled=True, pollar_secret_key="")
    assert get_integration_state(settings).status == "not_configured"


def test_pollar_credentials_do_not_claim_working_integration():
    settings = Settings(_env_file=None, pollar_enabled=True, pollar_secret_key="test_placeholder")
    assert get_integration_state(settings).status == "pending_implementation"


def test_mainnet_is_rejected():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, stellar_network="mainnet")


def test_sqlite_is_rejected():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, database_url="sqlite:///local.db")
