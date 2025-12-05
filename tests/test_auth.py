import pytest
from unittest.mock import MagicMock

#  TESTS FOR AUTH.PY

def test_verify_token_success(client, mock_auth):
    """Test that a valid token returns the User ID (UID)."""
    mock_auth.verify_id_token.return_value = {
        'uid': 'user_123',
        'email': 'test@example.com'
    }

    payload = {'token': 'valid_firebase_token_123'}
    response = client.post('/api/verify-token', json=payload)

    assert response.status_code == 200
    assert response.json['success'] is True
    assert response.json['uid'] == 'user_123'

def test_verify_token_invalid(client, mock_auth):
    """Test that an invalid token returns a 401 error."""
    mock_auth.verify_id_token.side_effect = Exception("Invalid token")

    payload = {'token': 'bad_token'}
    response = client.post('/api/verify-token', json=payload)

    assert response.status_code == 401
    assert "Invalid token" in response.json['error']