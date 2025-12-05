import pytest
from flask import Flask
from unittest.mock import MagicMock
import sys
import os

# 1. GLOBAL SETUP & MOCKS

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

# Mock external services
sys.modules['firebase_admin'] = MagicMock()
sys.modules['firebase_admin.firestore'] = MagicMock()
sys.modules['firebase_admin.auth'] = MagicMock()
sys.modules['firebase_config'] = MagicMock()

# Mock Config
mock_config = MagicMock()
mock_config.Config.BASE_URL = "http://test-url.com" 
mock_config.Config.TEST_EMAIL = "test@test.com"
mock_config.Config.SENDGRID_API_KEY = "fake_key"
mock_config.Config.FROM_EMAIL = "no-reply@test.com"
mock_config.Config.FIREBASE_CREDENTIALS = "fake_creds"
mock_config.Config.SECRET_KEY = "fake_secret"
sys.modules['config'] = mock_config

# Import Blueprints
from routes.books import books_bp
from routes.email import email_bp
from routes.auth import auth_bp
# Removed: from routes.debug import debug_bp (Cleaned up)

# 2. APP & CLIENT FIXTURES

@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test_secret'
    
    app.register_blueprint(books_bp)
    app.register_blueprint(email_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    # Removed: app.register_blueprint(debug_bp)
    
    return app

@pytest.fixture
def client(app):
    return app.test_client()

# 3. SPECIFIC SERVICE FIXTURES

@pytest.fixture
def mock_db(mocker):
    return mocker.patch('routes.books.db')

@pytest.fixture
def mock_send_email(mocker):
    return mocker.patch('routes.email.send_email', return_value=True)

@pytest.fixture
def mock_auth(mocker):
    return mocker.patch('routes.auth.firebase_auth')

