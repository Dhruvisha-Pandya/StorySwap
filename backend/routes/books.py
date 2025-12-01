from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from firebase_config import db

books_bp = Blueprint('books', __name__)

@books_bp.route('/add-book', methods=['POST'])
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

@books_bp.route('/get-books', methods=['GET'])
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

@books_bp.route('/update-book/<book_id>', methods=['PUT'])
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

@books_bp.route('/delete-book/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        ref = db.collection("books").document(book_id)

        if not ref.get().exists:
            return jsonify({"success": False, "message": "Not found"}), 404

        ref.delete()
        return jsonify({"success": True, "message": "Deleted!"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500