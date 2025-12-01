import requests
from config import Config

'''SMELL ADDRESSED: Feature Envy
WHY: Email logic was "envious" of SendGrid API details in route handlers.
Business logic (routes) shouldn't know about third-party API specifics.
This service layer abstracts away implementation details.

SMELL ADDRESSED: Single Responsibility Principle Violation
WHY: Route handlers should handle HTTP concerns (request/response).
Email sending is a separate concern that belongs in its own layer.

SMELL ADDRESSED: Code Duplication Risk
WHY: If multiple routes need to send emails, extracting this to a service
prevents copy-pasting the same SendGrid logic everywhere.'''

def send_email(to_email, subject, html_body):
    """
    Send email using SendGrid API.
    
    DESIGN DECISION: Service Layer Pattern
    WHY: This creates a boundary between our application and external services.
    If we switch from SendGrid to AWS SES, only this file changes.
    Routes remain untouched, demonstrating loose coupling.
    
    SMELL ADDRESSED: Primitive Obsession
    WHY: Instead of passing around raw strings and hoping they're correct,
    this function provides a clear contract with named parameters.
    """
    
    # SMELL ADDRESSED: Fail Fast Principle
    # WHY: Check preconditions early and return immediately if they fail.
    # This prevents wasted work and makes debugging easier.
    if not Config.SENDGRID_API_KEY or not Config.FROM_EMAIL:
        print("❌ Missing SendGrid API key or FROM_EMAIL")
        return False

    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        "Authorization": f"Bearer {Config.SENDGRID_API_KEY}",
        "Content-Type": "application/json"
    }

    # SMELL ADDRESSED: Magic Strings
    # WHY: Email structure is defined clearly here rather than scattered
    # across multiple route handlers with slight variations.
    data = {
        "personalizations": [{
            "to": [{"email": to_email}],
            "subject": subject
        }],
        "from": {"email": Config.FROM_EMAIL, "name": "StorySwap"},
        "content": [{
            "type": "text/html",
            "value": html_body
        }]
    }

    print(f"📤 Sending email via SendGrid → {to_email}")

    response = requests.post(url, headers=headers, json=data)

    # SMELL ADDRESSED: Complex Conditionals
    # WHY: Clear success/failure logic makes the code self-documenting.
    # Future maintainers immediately understand what constitutes success.
    if response.status_code in (200, 202):
        print("✅ Email sent successfully!")
        return True
    else:
        print("❌ SendGrid Error:", response.text)
        return False
    
    # BENEFIT: Testability
    # This function can be unit tested by mocking requests.post()
    # without needing a real SendGrid account or Flask app context.