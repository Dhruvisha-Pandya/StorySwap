from flask import Blueprint, jsonify
from services.email_service import send_email
from config import Config

debug_bp = Blueprint('debug', __name__)

@debug_bp.route('/test-email', methods=['GET'])
def test_email():
    test_to = Config.TEST_EMAIL
    print(f"🧪 Testing email to: {test_to}")

    success = send_email(
        to_email=test_to,
        subject="StorySwap Email Test (SendGrid)",
        html_body="<h1>SendGrid Test Successful!</h1><p>Your backend is sending emails.</p>"
    )

    return jsonify({
        "success": success,
        "message": "Email sent!" if success else "Failed to send email."
    })

@debug_bp.route('/debug-env', methods=['GET'])
def debug_env():
    return jsonify({
        "SENDGRID_API_KEY_set": bool(Config.SENDGRID_API_KEY),
        "FROM_EMAIL_set": bool(Config.FROM_EMAIL),
        "BASE_URL": Config.BASE_URL,
        "FIREBASE_CREDENTIALS_set": bool(Config.FIREBASE_CREDENTIALS),
        "FLASK_SECRET_KEY_set": bool(Config.SECRET_KEY)
    })