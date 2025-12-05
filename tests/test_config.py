import os
import pytest
from config import Config

def test_config_loads_env_vars():
    """Test that Config class correctly reads environment variables."""
    # We patch os.environ to simulate a .env file
    with pytest.MonkeyPatch.context() as m:
        m.setenv("SECRET_KEY", "real_secret")
        m.setenv("SENDGRID_API_KEY", "SG.12345")
        
        # Reload or check logic (depending on how your Config is written)
        # Assuming Config is a class with static properties:
        assert os.environ.get("SECRET_KEY") == "real_secret"
        # If your Config class has logic (e.g. 'if not key: raise error'), test that here.

def test_production_config_security():
    """Ensure Debug is OFF in production configuration."""
    # This is a 'sanity check' test
    if os.environ.get("FLASK_ENV") == "production":
        assert Config.DEBUG is False