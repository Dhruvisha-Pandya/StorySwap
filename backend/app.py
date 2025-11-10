from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Firebase Initialization
import json

# Firebase Initialization (using env vars on Render)
firebase_env = os.getenv("FIREBASE_CREDENTIALS")
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5000")

if firebase_env:
    cred_dict = json.loads(firebase_env)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    print("🔥 Firebase initialized from environment variables")
else:
    cred = credentials.Certificate("serviceAccount.json")
    firebase_admin.initialize_app(cred)
    print("🔥 Firebase initialized from local serviceAccount.json")

db = firestore.client()
print("Firebase connection successful!")


# Flask App Setup
app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')

# Flask-Mail Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

mail = Mail(app)

print("Flask secret key loaded:", bool(app.config['SECRET_KEY']))
print("Mail setup complete:", bool(app.config['MAIL_USERNAME']))


# ROUTE: Send Borrow Request
@app.route('/api/send-request', methods=['POST'])
def send_request():
    """Sends email to lender when borrower requests a book."""
    try:
        data = request.json
        lender_email = data.get("lenderEmail")
        lender_name = data.get("lenderName")
        borrower_name = data.get("borrowerName")
        borrower_email = data.get("borrowerEmail")
        book_title = data.get("bookTitle")

        if not all([lender_email, borrower_email, book_title]):
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        msg = Message(
            subject=f"Book Borrow Request: {book_title}",
            sender=app.config['MAIL_USERNAME'],
            recipients=[lender_email]
        )

        msg.html = f"""
        <div style="font-family: Arial; color:#333;">
            <h3>Hi {lender_name or 'there'},</h3>
            <p><strong>{borrower_name}</strong> ({borrower_email}) wants to borrow your book 
            <b>{book_title}</b> on StorySwap.</p>
            <p>You can contact the borrower directly to coordinate exchange.</p>
            <br>
            <a href="{BASE_URL}/api/respond-request?action=accept&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name}"
   style="background:#4CAF50;color:white;padding:8px 12px;text-decoration:none;border-radius:6px;">
   Accept Request
</a>
&nbsp;&nbsp;
<a href="{BASE_URL}/api/respond-request?action=decline&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name}"
   style="background:#f44336;color:white;padding:8px 12px;text-decoration:none;border-radius:6px;">
   Decline Request
</a>

            <br><br>
            <p>Regards,<br><b>StorySwap Team</b></p>
        </div>
        """

        mail.send(msg)
        print(f"📩 Request email sent to {lender_email}")
        return jsonify({"success": True, "message": "Request email sent successfully!"}), 200

    except Exception as e:
        print("❌ Error sending email:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/respond-request', methods=['GET'])
def respond_request():
    """Triggered when lender clicks Accept or Decline link in email."""
    try:
        action = request.args.get("action")
        borrower_email = request.args.get("borrowerEmail")
        book_title = request.args.get("bookTitle")
        lender_name = request.args.get("lenderName")

        if not all([action, borrower_email, book_title, lender_name]):
            return jsonify({"success": False, "message": "Missing required params"}), 400

        # Compose message
        status_text = "accepted" if action == "accept" else "declined"
        subject = f"Your borrow request has been {status_text}"
        msg = Message(
            subject=subject,
            sender=app.config['MAIL_USERNAME'],
            recipients=[borrower_email]
        )

        msg.html = f"""
        <div style="font-family: Arial; color:#333;">
            <h3>Hello!</h3>
            <p>Your request to borrow the book <b>{book_title}</b> has been 
            <b style="color:{'green' if action == 'accept' else 'red'}">{status_text}</b> by {lender_name}.</p>
            <p>Thank you for using StorySwap!</p>
            <br>
            <p>Regards,<br><b>StorySwap Team</b></p>
        </div>
        """

        mail.send(msg)
        print(f"📨 Sent {action.upper()} confirmation to {borrower_email}")

        # ✅ Return a popup alert instead of plain text page
        return f"""
        <script>
            alert('✅ Your response has been recorded. Borrower has been notified.');
            window.close();
        </script>
        """, 200

    except Exception as e:
        print("❌ Error sending response email:", str(e))
        return f"<script>alert('❌ Error: {str(e)}');</script>", 500

# ROUTE: Add Book to Firestore
@app.route('/api/add-book', methods=['POST'])
def add_book():
    """Adds a new book to Firestore."""
    try:
        data = request.get_json()
        required_fields = ["title", "author", "genre", "condition", "description", "coverBase64", "ownerId"]

        if not all(field in data and data[field] for field in required_fields):
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        # Default availability = "Available"
        data["availability"] = data.get("availability", "Available")

        # Save to Firestore
        book_ref = db.collection("books").add({
            "title": data["title"],
            "author": data["author"],
            "genre": data["genre"],
            "condition": data["condition"],
            "description": data["description"],
            "coverBase64": data["coverBase64"],
            "ownerId": data["ownerId"],
            "availability": data["availability"],
            "createdAt": firestore.SERVER_TIMESTAMP
        })

        print(f"📚 Book '{data['title']}' added by user {data['ownerId']}")
        return jsonify({"success": True, "message": "Book added successfully!"}), 200

    except Exception as e:
        print("❌ Error adding book:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500


# ROUTE: Get Books for a User
@app.route('/api/get-books', methods=['GET'])
def get_books():
    """Fetch all books for a given ownerId."""
    try:
        owner_id = request.args.get("ownerId")
        if not owner_id:
            return jsonify({"success": False, "message": "Missing ownerId"}), 400

        books_ref = db.collection("books").where("ownerId", "==", owner_id)
        docs = books_ref.stream()

        books = []
        for doc in docs:
            book_data = doc.to_dict()
            book_data["id"] = doc.id  # include document ID
            books.append(book_data)

        return jsonify({"success": True, "books": books}), 200
    except Exception as e:
        print("❌ Error fetching books:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500


# ROUTE: Update Book
@app.route('/api/update-book/<book_id>', methods=['PUT'])
def update_book(book_id):
    """Updates book details such as title, description, availability, etc."""
    try:
        data = request.get_json()
        book_ref = db.collection("books").document(book_id)

        # Check if book exists
        if not book_ref.get().exists:
            return jsonify({"success": False, "message": "Book not found"}), 404

        # Only update provided fields
        update_fields = {k: v for k, v in data.items() if v is not None}
        book_ref.update(update_fields)

        print(f"✏️ Book {book_id} updated with {list(update_fields.keys())}")
        return jsonify({"success": True, "message": "Book updated successfully!"}), 200
    except Exception as e:
        print("❌ Error updating book:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500


# ROUTE: Delete Book
@app.route('/api/delete-book/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    """Deletes a book from Firestore."""
    try:
        book_ref = db.collection("books").document(book_id)
        if not book_ref.get().exists:
            return jsonify({"success": False, "message": "Book not found"}), 404

        book_ref.delete()
        print(f"🗑️ Book {book_id} deleted")
        return jsonify({"success": True, "message": "Book deleted successfully!"}), 200
    except Exception as e:
        print("❌ Error deleting book:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500


# Serve React Frontend (Production Build)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    return send_from_directory('../frontend/build', 'index.html')


if __name__ == '__main__':
    app.run(debug=True, port=5000)
