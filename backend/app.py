from dotenv import load_dotenv
load_dotenv()
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import smtplib
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# 🔥 Initialize Firebase (Local OR Render ENV)
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

# 📧 Gmail SMTP Setup (FREE — No Domain Required)
SMTP_EMAIL = os.getenv("SMTP_EMAIL")         # your Gmail
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")   # Gmail App Password (NOT normal password)

def send_email(to_email, subject, html_body):
    try:
        print(f"📧 Attempting to send email to: {to_email}")
        print(f"📧 Using SMTP_EMAIL: {SMTP_EMAIL}")
        print(f"📧 Subject: {subject}")
        
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            print("❌ SMTP credentials missing!")
            return False

        # Set a timeout to avoid hanging
        socket.setdefaulttimeout(15)  # 15 second timeout

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"StorySwap <{SMTP_EMAIL}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        print("🔌 Attempting SMTP connection...")
        
        # Try different connection methods
        try:
            # Method 1: TLS (Recommended)
            print("🔄 Trying TLS on port 587...")
            server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
            server.ehlo()
            server.starttls()
            server.ehlo()
            print("🔐 Attempting login...")
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            print("✅ Logged in successfully")
            print("📤 Sending email...")
            server.send_message(msg)
            server.quit()
            print("✅ Email sent successfully via TLS!")
            return True
            
        except Exception as tls_error:
            print(f"❌ TLS failed: {tls_error}")
            print("🔄 Trying SSL on port 465...")
            
            # Method 2: SSL (Fallback)
            try:
                server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15)
                server.ehlo()
                print("🔐 Attempting login...")
                server.login(SMTP_EMAIL, SMTP_PASSWORD)
                print("✅ Logged in successfully")
                print("📤 Sending email...")
                server.send_message(msg)
                server.quit()
                print("✅ Email sent successfully via SSL!")
                return True
                
            except Exception as ssl_error:
                print(f"❌ SSL also failed: {ssl_error}")
                return False
                
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ AUTHENTICATION FAILED: {e}")
        print("💡 TROUBLESHOOTING:")
        print("   1. Go to Google Account → Security")
        print("   2. Enable 2-Factor Authentication")
        print("   3. Generate an APP PASSWORD (not your regular password)")
        print("   4. Use the 16-character app password in SMTP_PASSWORD")
        return False
        
    except smtplib.SMTPConnectError as e:
        print(f"❌ CONNECTION FAILED: {e}")
        print("💡 Check firewall/network settings")
        return False
        
    except socket.timeout:
        print("❌ SMTP connection timed out")
        return False
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        print(f"❌ Error type: {type(e).__name__}")
        return False


# Flask Setup
app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')


# 🧪 TEST ENDPOINT - USE THIS FIRST!
@app.route('/api/test-email', methods=['GET'])
def test_email():
    """TEST THIS ENDPOINT FIRST to check if emails work"""
    try:
        test_email = "pandyadhruvisha@gmail.com"  # ⚠️ CHANGE THIS TO YOUR EMAIL
        print(f"🧪 Starting email test to: {test_email}")
        
        success = send_email(
            to_email=test_email,
            subject="🚀 TEST from StorySwap - URGENT",
            html_body="""
            <h1>🎉 TEST SUCCESSFUL!</h1>
            <p>This is a test email from StorySwap.</p>
            <p>If you receive this, your email system is working perfectly!</p>
            <p><strong>Time:</strong> This email was sent to verify SMTP configuration.</p>
            <hr>
            <p>StorySwap Team</p>
            """
        )
        
        if success:
            print("🎉 TEST PASSED: Email sent successfully!")
            return jsonify({"success": True, "message": "Test email sent! Check your inbox and spam folder."})
        else:
            print("💥 TEST FAILED: Email sending failed")
            return jsonify({"success": False, "message": "Failed to send test email. Check Render logs for details."})
            
    except Exception as e:
        print(f"💥 TEST ERROR: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500


# 🔍 DEBUG ENDPOINT - Check environment
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


# 📩 Send Borrow Request Email
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
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                .button {{ display: inline-block; padding: 12px 24px; margin: 10px 5px; 
                         text-decoration: none; border-radius: 5px; font-weight: bold; }}
                .accept {{ background: #4CAF50; color: white; }}
                .decline {{ background: #f44336; color: white; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h3>Hi {lender_name or 'there'},</h3>
                <p><strong>{borrower_name}</strong> ({borrower_email}) wants to borrow your book 
                <b>"{book_title}"</b> on StorySwap.</p>

                <p>Please choose a response:</p>

                <a href="{BASE_URL}/api/respond-request?action=accept&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name or 'Lender'}"
                   class="button accept">
                   ✅ Accept Request
                </a>

                <a href="{BASE_URL}/api/respond-request?action=decline&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name or 'Lender'}"
                   class="button decline">
                   ❌ Decline Request
                </a>

                <br><br>
                <p><em>This link will expire in 7 days.</em></p>
                
                <hr>
                <p>Regards,<br><b>StorySwap Team</b></p>
            </div>
        </body>
        </html>
        """

        print("📧 Attempting to send borrow request email...")
        success = send_email(
            to_email=lender_email,
            subject=f"📚 Borrow Request for '{book_title}'",
            html_body=email_body
        )

        if success:
            print("✅ Borrow request email sent successfully!")
            return jsonify({"success": True, "message": "Request email sent successfully!"}), 200
        else:
            print("❌ Failed to send borrow request email")
            return jsonify({"success": False, "message": "Failed to send email notification. Please try again."}), 500

    except Exception as e:
        print("❌ Route Error:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# 📩 Respond to Request (Accept / Decline)
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
        color = "#4CAF50" if action == "accept" else "#f44336"
        emoji = "✅" if action == "accept" else "❌"

        email_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .status {{ color: {color}; font-weight: bold; font-size: 18px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h3>Hello {borrower_email.split('@')[0]}!</h3>
                <p>Your request to borrow <b>"{book_title}"</b> has been 
                <span class="status">{emoji} {status_text}</span>
                by {lender_name}.</p>
                
                <p>{"🎉 Great! You can now coordinate the book exchange details with the lender." 
                    if action == "accept" 
                    else "Maybe try requesting another book from our community!"}</p>
                
                <hr>
                <p>Thank you for using <b>StorySwap</b>!</p>
            </div>
        </body>
        </html>
        """

        print(f"📧 Attempting to send {status_text} notification...")
        success = send_email(
            to_email=borrower_email,
            subject=f"📚 Your borrow request was {status_text}",
            html_body=email_body
        )

        if success:
            print(f"✅ {status_text} notification sent successfully!")
            return f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Response Recorded</title>
                <style>
                    body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                    .success {{ color: #4CAF50; font-size: 24px; }}
                </style>
            </head>
            <body>
                <div class="success">✅ Response Recorded!</div>
                <p>The borrower has been notified of your decision.</p>
                <p>You can close this window now.</p>
                <script>
                    setTimeout(() => window.close(), 3000);
                </script>
            </body>
            </html>
            """
        else:
            return """
            <!DOCTYPE html>
            <html>
            <body>
                <div style="text-align: center; padding: 50px;">
                    <div style="color: #f44336; font-size: 24px;">⚠️ Response Recorded</div>
                    <p>But we couldn't notify the borrower via email.</p>
                    <p>You can close this window.</p>
                </div>
                <script>setTimeout(() => window.close(), 3000);</script>
            </body>
            </html>
            """

    except Exception as e:
        return f"""
        <!DOCTYPE html>
        <html>
        <body>
            <div style="text-align: center; padding: 50px; color: #f44336;">
                <h1>Error</h1>
                <p>Something went wrong: {str(e)}</p>
                <p>Please try again later.</p>
            </div>
        </body>
        </html>
        """, 500


# 📚 Add Book
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


# 📚 Get Books for User
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


# 📚 Update Book
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


# 🗑️ Delete Book
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


# Serve React build (Production)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    return send_from_directory('../frontend/build', 'index.html')


# Run
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)