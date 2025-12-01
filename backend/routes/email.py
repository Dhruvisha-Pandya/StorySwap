from flask import Blueprint, request, jsonify
from services.email_service import send_email
from config import Config

email_bp = Blueprint('email', __name__)

@email_bp.route('/send-request', methods=['POST'])
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

            <a href="{Config.BASE_URL}/api/respond-request?action=accept&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name}"
               style="background:#4CAF50;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
               ✅ Accept
            </a>

            <a href="{Config.BASE_URL}/api/respond-request?action=decline&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name}"
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

@email_bp.route('/respond-request', methods=['GET'])
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