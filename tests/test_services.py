import pytest
from unittest.mock import MagicMock
import sys
import os

# 1. Path Setup to find the 'services' folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), './backend')))
from services.email_service import send_email

def test_send_email_success(mocker):
    """
    Test that send_email correctly formats the HTTP request to SendGrid
    and returns True when the API responds with 200/202.
    """
    # 1. Mock Config values (so we don't need real keys)
    mocker.patch('services.email_service.Config.SENDGRID_API_KEY', 'fake_api_key')
    mocker.patch('services.email_service.Config.FROM_EMAIL', 'no-reply@storyswap.com')

    # 2. Mock requests.post to avoid actual network calls
    mock_post = mocker.patch('services.email_service.requests.post')
    mock_response = MagicMock()
    mock_response.status_code = 202  # SendGrid "Accepted"
    mock_post.return_value = mock_response

    # 3. Call the function
    to_email = "test@user.com"
    subject = "Welcome!"
    body = "<p>Hi there</p>"
    
    result = send_email(to_email, subject, body)

    # 4. Assertions
    assert result is True
    
    # Verify we called the correct URL with correct Headers
    mock_post.assert_called_once()
    call_args = mock_post.call_args
    # call_args is a tuple: (args, kwargs)
    # kwargs contains 'url', 'headers', 'json'
    
    assert call_args.kwargs['headers']['Authorization'] == "Bearer fake_api_key"
    assert call_args.kwargs['json']['personalizations'][0]['to'][0]['email'] == to_email
    assert call_args.kwargs['json']['from']['email'] == "no-reply@storyswap.com"

def test_send_email_missing_config(mocker):
    """
    Test that the function fails fast (returns False) if 
    API Key or From Email is missing in Config.
    """
    # Force API Key to be None
    mocker.patch('services.email_service.Config.SENDGRID_API_KEY', None)
    mocker.patch('services.email_service.Config.FROM_EMAIL', 'test@test.com')
    
    # Mock requests just in case (it shouldn't be called)
    mock_post = mocker.patch('services.email_service.requests.post')

    result = send_email("user@test.com", "Sub", "Body")

    assert result is False
    # Verify we NEVER tried to send the request
    mock_post.assert_not_called()

def test_send_email_api_error(mocker):
    """
    Test that the function returns False if SendGrid returns an error 
    (e.g., 401 Unauthorized or 500 Server Error).
    """
    # Setup valid config
    mocker.patch('services.email_service.Config.SENDGRID_API_KEY', 'key')
    mocker.patch('services.email_service.Config.FROM_EMAIL', 'email')

    # Mock a failed response from SendGrid (e.g., Bad Request)
    mock_post = mocker.patch('services.email_service.requests.post')
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.text = "Bad Request: Missing field"
    mock_post.return_value = mock_response

    result = send_email("user@test.com", "Sub", "Body")

    assert result is False