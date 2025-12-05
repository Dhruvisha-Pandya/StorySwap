# email.py
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
        <body style='font-family: Arial, sans-serif;'>
            <h3>Dear {lender_name or 'Lender'},</h3>

            <p>The following user has expressed interest in borrowing your book:</p>

            <p><strong>Borrower:</strong> {borrower_name} ({borrower_email})<br>
               <strong>Book Title:</strong> "{book_title}"</p>

            <p>Please choose one of the following options:</p>

            <a href="{Config.BASE_URL}/api/respond-request?action=accept&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name}"
               style="background:#2E7D32;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
               Accept Request
            </a>

            <a href="{Config.BASE_URL}/api/respond-request?action=decline&borrowerEmail={borrower_email}&bookTitle={book_title}&lenderName={lender_name}"
               style="background:#C62828;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;margin-left:10px;">
               Decline Request
            </a>

            <p style="margin-top:20px;font-size:14px;color:#555;">
                This link will remain active for 7 days.
            </p>
        </body>
        </html>
        """

        success = send_email(
            to_email=lender_email,
            subject=f"Borrow Request for '{book_title}'",
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

        status_display = "✔️ ACCEPTED" if action == "accept" else "❌ DECLINED"

        email_body = f"""
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <h3>Request Update</h3>

            <p>Your request to borrow the following book has been reviewed:</p>

            <p><strong>Book Title:</strong> "{book_title}"<br>
               <strong>Status:</strong> {status_display}<br>
               <strong>Responded By:</strong> {lender_name}</p>

            <p>If you have any further questions, feel free to contact the lender directly.</p>
        </body>
        </html>
        """

        send_email(
            to_email=borrower_email,
            subject=f"Your Book Request Has Been {status_display}",
            html_body=email_body
        )

        return """
        <h1>Response Recorded</h1>
        <p>The borrower has been notified of your decision.</p>
        """

    except Exception as e:
        return f"Error: {str(e)}", 500
