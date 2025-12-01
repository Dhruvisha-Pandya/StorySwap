import requests
from config import Config

def send_email(to_email, subject, html_body):
    """Send email using SendGrid API"""
    if not Config.SENDGRID_API_KEY or not Config.FROM_EMAIL:
        print("❌ Missing SendGrid API key or FROM_EMAIL")
        return False

    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        "Authorization": f"Bearer {Config.SENDGRID_API_KEY}",
        "Content-Type": "application/json"
    }

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

    if response.status_code in (200, 202):
        print("✅ Email sent successfully!")
        return True
    else:
        print("❌ SendGrid Error:", response.text)
        return False