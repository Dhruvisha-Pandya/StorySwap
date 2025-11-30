from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import requests

# -------------------------------------------------------
# 🔥 Initialize Firebase (Local OR Render ENV)
firebase_env = os.getenv("FIREBASE_CREDENTIALS")
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5000")

print("🔍 DEBUG: Checking environment variables...")
print(f"BASE_URL: {BASE_URL}")
print(f"SENDGRID_API_KEY exists: {bool(os.getenv('SENDGRID_API_KEY'))}")
print(f"FROM_EMAIL exists: {bool(os.getenv('FROM_EMAIL'))}")
print(f"FIREBASE_CREDENTIALS exists: {bool(firebase_env)}")

if firebase_env:
    cred_dict = json.loads(firebase_env)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    print("🔥 Firebase initialized using Render environment")
else:
    cred = credentials.Certificate("serviceAccount.json")
    firebase_admin.initialize_app(cred)
    print("🔥 Firebase initialized using local serviceAccount.json")

db = firestore.client()

# -------------------------------------------------------
# 📧 SETUP — SendGrid API
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")

def send_email(to_email, subject, html_body):
    """Send email using SendGrid API"""
    if not SENDGRID_API_KEY or not FROM_EMAIL:
        print("❌ Missing SendGrid API key or FROM_EMAIL")
        return False

    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        "Authorization": f"Bearer {SENDGRID_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "personalizations": [{
            "to": [{"email": to_email}],
            "subject": subject
        }],
        "from": {"email": FROM_EMAIL, "name": "StorySwap"},
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

# -------------------------------------------------------
# Flask Setup
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')

# -------------------------------------------------------
# 🧪 TEST ENDPOINT
@app.route('/api/test-email', methods=['GET'])
def test_email():
    test_to = os.getenv("TEST_EMAIL", "yourEmail@gmail.com")
    print(f"🧪 Testing email to: {test_to}")

    success = send_email(
        to_email=test_to,
        subject="🚀 StorySwap Email Test (SendGrid)",
        html_body="<h1>🎉 SendGrid Test Successful!</h1><p>Your backend is sending emails.</p>"
    )

    return jsonify({
        "success": success,
        "message": "Email sent!" if success else "Failed to send email."
    })

# -------------------------------------------------------
# 🔍 DEBUG ENV ENDPOINT
@app.route('/api/debug-env', methods=['GET'])
def debug_env():
    return jsonify({
        "SENDGRID_API_KEY_set": bool(SENDGRID_API_KEY),
        "FROM_EMAIL_set": bool(FROM_EMAIL),
        "BASE_URL": BASE_URL,
        "FIREBASE_CREDENTIALS_set": bool(firebase_env),
        "FLASK_SECRET_KEY_set": bool(os.getenv("FLASK_SECRET_KEY"))
    })

# -------------------------------------------------------
# 📩 SEND BORROW REQUEST
@app.route('/api/send-request', methods=['POST'])
def send_request():
    try:
        data = request.json
        lender_email = data.get("lenderEmail")
        lender_name = data.get("lenderName")
        borrower_name = data.get("borrowerName")
        borrower_email = data.get("borrowerEmail")
        book_title = data.get("bookTitle")

        if not all([lender_email, borrower_email, book_title]):
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        email_body = f"""
        <html>
        <body style='font-family: Arial;'>
            <h3>Hi {lender_name or 'there'},</h3>
            <p><b>{borrower_name}</b> ({borrower_email}) wants to borrow your book:</p>
            <h2>"{book_title}"</h2>

            <p>Choose a response:</p>

            <a href="{BASE_URL}/api/respond-request?action=accept&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name}"
               style="background:#4CAF50;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
               ✅ Accept
            </a>

            <a href="{BASE_URL}/api/respond-request?action=decline&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name}"
               style="background:#f44336;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;margin-left:10px;">
               ❌ Decline
            </a>

            <p><em>Link auto-expires in 7 days.</em></p>
        </body>
        </html>
        """

        success = send_email(
            to_email=lender_email,
            subject=f"📚 Borrow Request for '{book_title}'",
            html_body=email_body
        )

        return jsonify({
            "success": success,
            "message": "Email sent!" if success else "Failed to send email."
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# -------------------------------------------------------
# 📩 ACCEPT / DECLINE RESPONSE
@app.route('/api/respond-request', methods=['GET'])
def respond_request():
    try:
        action = request.args.get("action")
        borrower_email = request.args.get("borrowerEmail")
        book_title = request.args.get("bookTitle")
        lender_name = request.args.get("lenderName")

        if not all([action, borrower_email, book_title, lender_name]):
            return "Missing parameters", 400

        status = "accepted" if action == "accept" else "declined"
        emoji = "✅" if action == "accept" else "❌"

        email_body = f"""
        <html>
        <body style='font-family: Arial;'>
            <h3>Hello!</h3>
            <p>Your request to borrow <b>"{book_title}"</b> was:</p>
            <h2>{emoji} {status.upper()}</h2>
            <p>By: {lender_name}</p>
        </body>
        </html>
        """

        send_email(
            to_email=borrower_email,
            subject=f"📚 Your Book Request Was {status}",
            html_body=email_body
        )

        return f"<h1>Response Recorded!</h1><p>The borrower has been notified.</p>"

    except Exception as e:
        return f"Error: {str(e)}", 500

# -------------------------------------------------------
# 📚 ADD BOOK
@app.route('/api/add-book', methods=['POST'])
def add_book():
    try:
        data = request.get_json()
        required = ["title", "author", "genre", "condition",
                    "description", "coverBase64", "ownerId"]

        if not all(x in data and data[x] for x in required):
            return jsonify({"success": False, "message": "Missing fields"}), 400

        data["availability"] = data.get("availability", "Available")

        db.collection("books").add({
            **data,
            "createdAt": firestore.SERVER_TIMESTAMP
        })

        return jsonify({"success": True, "message": "Book added!"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# -------------------------------------------------------
# 📚 GET BOOKS
@app.route('/api/get-books', methods=['GET'])
def get_books():
    try:
        owner_id = request.args.get("ownerId")
        if not owner_id:
            return jsonify({"success": False, "message": "Missing ownerId"}), 400

        docs = db.collection("books").where("ownerId", "==", owner_id).stream()

        books = []
        for doc in docs:
            b = doc.to_dict()
            b["id"] = doc.id
            books.append(b)

        return jsonify({"success": True, "books": books})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# -------------------------------------------------------
# 📚 UPDATE BOOK
@app.route('/api/update-book/<book_id>', methods=['PUT'])
def update_book(book_id):
    try:
        data = request.get_json()
        ref = db.collection("books").document(book_id)

        if not ref.get().exists:
            return jsonify({"success": False, "message": "Not found"}), 404

        ref.update({k: v for k, v in data.items() if v is not None})

        return jsonify({"success": True, "message": "Updated!"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# -------------------------------------------------------
# 🗑 DELETE BOOK
@app.route('/api/delete-book/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        ref = db.collection("books").document(book_id)

        if not ref.get().exists:
            return jsonify({"success": False, "message": "Not found"}), 404

        ref.delete()
        return jsonify({"success": True, "message": "Deleted!"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# -------------------------------------------------------
# SERVE REACT BUILD
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    return send_from_directory('../frontend/build', 'index.html')

# -------------------------------------------------------
# RUN
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
