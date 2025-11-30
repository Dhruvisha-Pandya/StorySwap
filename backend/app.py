from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import resend
import os
import json

# -------------------------------------------------------
# 🔥 Initialize Firebase (Local OR Render ENV)
# -------------------------------------------------------
firebase_env = os.getenv("FIREBASE_CREDENTIALS")
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5000")

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
# 🔥 Resend API init
# -------------------------------------------------------
resend.api_key = os.getenv("RESEND_API_KEY")

# -------------------------------------------------------
# Flask Setup
# -------------------------------------------------------
app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')


# -------------------------------------------------------
# 📩 Send Borrow Request Email (Resend)
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

        resend.Emails.send({
            "from": "StorySwap <onboarding@resend.dev>",
            "to": lender_email,
            "subject": f"Borrow Request for {book_title}",
            "html": email_body
        })

        return jsonify({"success": True, "message": "Request email sent!"}), 200

    except Exception as e:
        print("❌ Resend Error:", e)
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

        if not all([action, borrower_email, book_title, lender_name]):
            return jsonify({"success": False, "message": "Missing parameters"}), 400

        status_text = "accepted" if action == "accept" else "declined"

        email_body = f"""
        <h3>Hello!</h3>
        <p>Your request to borrow <b>{book_title}</b> has been 
        <b style='color:{'green' if action == 'accept' else 'red'}'>{status_text}</b>
        by {lender_name}.</p>
        <p>Thank you for using StorySwap!</p>
        """

        resend.Emails.send({
            "from": "StorySwap <onboarding@resend.dev>",
            "to": borrower_email,
            "subject": f"Your Borrow Request Was {status_text}",
            "html": email_body
        })

        return """
        <script>
            alert("Response recorded. Borrower notified.");
            window.close();
        </script>
        """

    except Exception as e:
        return f"<script>alert('Error: {str(e)}');</script>", 500


# -------------------------------------------------------
# 📚 Add Book
# -------------------------------------------------------
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


# -------------------------------------------------------
# 📚 Get Books for User
# -------------------------------------------------------
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


# -------------------------------------------------------
# 📚 Update Book
# -------------------------------------------------------
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


# -------------------------------------------------------
# 🗑️ Delete Book
# -------------------------------------------------------
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
