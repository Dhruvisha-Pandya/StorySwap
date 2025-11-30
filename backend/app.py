from dotenv import load_dotenv
load_dotenv()
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# -------------------------------------------------------
# 🔥 Initialize Firebase (Local OR Render ENV)
# -------------------------------------------------------
firebase_env = os.getenv("FIREBASE_CREDENTIALS")
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5000")

# DEBUG: Print all environment variables (except passwords)
print("🔍 DEBUG: Checking environment variables...")
print(f"BASE_URL: {BASE_URL}")
print(f"SMTP_EMAIL exists: {bool(os.getenv('SMTP_EMAIL'))}")
print(f"SMTP_PASSWORD exists: {bool(os.getenv('SMTP_PASSWORD'))}")
print(f"FIREBASE_CREDENTIALS exists: {bool(os.getenv('FIREBASE_CREDENTIALS'))}")

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
# 📧 Gmail SMTP Setup (FREE — No Domain Required)
# -------------------------------------------------------
SMTP_EMAIL = os.getenv("SMTP_EMAIL")         # your Gmail
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")   # Gmail App Password (NOT normal password)

def send_email(to_email, subject, html_body):
    try:
        print(f"📧 Attempting to send email to: {to_email}")
        print(f"📧 Using SMTP_EMAIL: {SMTP_EMAIL}")
        print(f"📧 SMTP_PASSWORD length: {len(SMTP_PASSWORD) if SMTP_PASSWORD else 'MISSING'}")
        print(f"📧 Subject: {subject}")
        
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            print("❌ CRITICAL: SMTP credentials are missing!")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email

        msg.attach(MIMEText(html_body, "html"))

        print("🔌 Connecting to SMTP server (smtp.gmail.com:465)...")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            print("✅ Connected to SMTP server")
            print("🔐 Attempting login...")
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            print("✅ Logged in successfully")
            print("📤 Sending email...")
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
            print("✅ Email sent successfully!")
            
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP AUTHENTICATION FAILED: {e}")
        print("💡 TROUBLESHOOTING: Check if:")
        print("   - You're using an APP PASSWORD (not your regular Gmail password)")
        print("   - 2-Factor Authentication is enabled in your Google account")
        print("   - You generated the app password correctly")
        return False
    except smtplib.SMTPConnectError as e:
        print(f"❌ SMTP CONNECTION FAILED: {e}")
        print("💡 TROUBLESHOOTING: Check your internet connection and firewall settings")
        return False
    except Exception as e:
        print(f"❌ UNEXPECTED EMAIL ERROR: {str(e)}")
        print(f"❌ Error type: {type(e).__name__}")
        return False


# -------------------------------------------------------
# Flask Setup
# -------------------------------------------------------
app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')


# -------------------------------------------------------
# 🧪 TEST ENDPOINT - USE THIS FIRST!
# -------------------------------------------------------
@app.route('/api/test-email', methods=['GET'])
def test_email():
    """TEST THIS ENDPOINT FIRST to check if emails work"""
    try:
        test_email = "your_personal_email@gmail.com"  # ⚠️ CHANGE THIS TO YOUR EMAIL
        print(f"🧪 Starting email test to: {test_email}")
        
        success = send_email(
            to_email=test_email,
            subject="🚀 TEST from StorySwap - URGENT",
            html_body="<h1>This is a CRITICAL TEST email</h1><p>If you receive this, email is working!</p>"
        )
        
        if success:
            print("🎉 TEST PASSED: Email sent successfully!")
            return jsonify({"success": True, "message": "Test email sent! Check your inbox."})
        else:
            print("💥 TEST FAILED: Email sending failed")
            return jsonify({"success": False, "message": "Failed to send test email. Check logs."})
            
    except Exception as e:
        print(f"💥 TEST ERROR: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500


# -------------------------------------------------------
# 🔍 DEBUG ENDPOINT - Check environment
# -------------------------------------------------------
@app.route('/api/debug-env', methods=['GET'])
def debug_env():
    """Check if all environment variables are loaded correctly"""
    return jsonify({
        "SMTP_EMAIL_set": bool(SMTP_EMAIL),
        "SMTP_PASSWORD_set": bool(SMTP_PASSWORD),
        "BASE_URL": BASE_URL,
        "FIREBASE_CREDENTIALS_set": bool(os.getenv("FIREBASE_CREDENTIALS")),
        "FLASK_SECRET_KEY_set": bool(os.getenv("FLASK_SECRET_KEY"))
    })


# -------------------------------------------------------
# 📩 Send Borrow Request Email
# -------------------------------------------------------
@app.route('/api/send-request', methods=['POST'])
def send_request():
    try:
        data = request.json
        lender_email = data.get("lenderEmail")
        lender_name = data.get("lenderName")
        borrower_name = data.get("borrowerName")
        borrower_email = data.get("borrowerEmail")
        book_title = data.get("bookTitle")

        print(f"📩 Received borrow request:")
        print(f"   Lender: {lender_name} ({lender_email})")
        print(f"   Borrower: {borrower_name} ({borrower_email})")
        print(f"   Book: {book_title}")

        if not all([lender_email, borrower_email, book_title]):
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        email_body = f"""
        <h3>Hi {lender_name or 'there'},</h3>
        <p><strong>{borrower_name}</strong> ({borrower_email}) wants to borrow your book 
        <b>{book_title}</b> on StorySwap.</p>

        <p>Please choose a response:</p>

        <a href="{BASE_URL}/api/respond-request?action=accept&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name}"
           style="background:#4CAF50;color:white;padding:10px 14px;text-decoration:none;border-radius:6px;">
           Accept
        </a>

        &nbsp;

        <a href="{BASE_URL}/api/respond-request?action=decline&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name}"
           style="background:#f44336;color:white;padding:10px 14px;text-decoration:none;border-radius:6px;">
           Decline
        </a>

        <br><br>
        <p>Regards,<br><b>StorySwap Team</b></p>
        """

        print("📧 Attempting to send borrow request email...")
        email_sent = send_email(
            to_email=lender_email,
            subject=f"Borrow Request for {book_title}",
            html_body=email_body
        )

        if email_sent:
            print("✅ Borrow request email sent successfully!")
            return jsonify({"success": True, "message": "Request email sent!"}), 200
        else:
            print("❌ Failed to send borrow request email")
            return jsonify({"success": False, "message": "Failed to send email"}), 500

    except Exception as e:
        print("❌ Email Error:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# -------------------------------------------------------
# 📩 Respond to Request (Accept / Decline)
# -------------------------------------------------------
@app.route('/api/respond-request', methods=['GET'])
def respond_request():
    try:
        action = request.args.get("action")
        borrower_email = request.args.get("borrowerEmail")
        book_title = request.args.get("bookTitle")
        lender_name = request.args.get("lenderName")

        print(f"🔄 Response request received:")
        print(f"   Action: {action}")
        print(f"   Borrower: {borrower_email}")
        print(f"   Book: {book_title}")
        print(f"   Lender: {lender_name}")

        if not all([action, borrower_email, book_title, lender_name]):
            return jsonify({"success": False, "message": "Missing parameters"}), 400

        status_text = "accepted" if action == "accept" else "declined"
        color = "green" if action == "accept" else "red"

        email_body = f"""
        <h3>Hello!</h3>
        <p>Your request to borrow <b>{book_title}</b> has been 
        <b style='color:{color}'>{status_text}</b>
        by {lender_name}.</p>
        <p>Thank you for using StorySwap!</p>
        """

        print(f"📧 Attempting to send {status_text} notification...")
        email_sent = send_email(
            to_email=borrower_email,
            subject=f"Your Borrow Request Was {status_text}",
            html_body=email_body
        )

        if email_sent:
            print(f"✅ {status_text} notification sent successfully!")
            return """
            <script>
                alert("Response recorded. Borrower notified.");
                window.close();
            </script>
            """
        else:
            return """
            <script>
                alert("Response recorded but failed to notify borrower.");
                window.close();
            </script>
            """

    except Exception as e:
        return f"<script>alert('Error: {str(e)}');</script>", 500

# ... (keep your existing book routes as they are - they're working fine)

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

        return jsonify({"success": True, "message": "Book added!"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

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

        return jsonify({"success": True, "books": books}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/update-book/<book_id>', methods=['PUT'])
def update_book(book_id):
    try:
        data = request.get_json()
        ref = db.collection("books").document(book_id)

        if not ref.get().exists:
            return jsonify({"success": False, "message": "Not found"}), 404

        ref.update({k: v for k, v in data.items() if v is not None})

        return jsonify({"success": True, "message": "Updated!"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/delete-book/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        ref = db.collection("books").document(book_id)

        if not ref.get().exists:
            return jsonify({"success": False, "message": "Not found"}), 404

        ref.delete()
        return jsonify({"success": True, "message": "Deleted!"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# -------------------------------------------------------
# Serve React build (Production)
# -------------------------------------------------------
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    return send_from_directory('../frontend/build', 'index.html')


# -------------------------------------------------------
# Run
# -------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)