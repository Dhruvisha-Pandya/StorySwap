from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from firebase_config import db

'''SMELL ADDRESSED: Long Method / God Class
WHY: app.py was becoming a monolithic file with too many responsibilities.
Blueprints allow logical grouping of related routes, making the codebase
navigable and maintainable.

DESIGN DECISION: Blueprint Pattern
WHY: Flask Blueprints enable modular application structure. Each blueprint
is a self-contained unit that can be tested, developed, and even reused
in other Flask applications independently.'''

books_bp = Blueprint('books', __name__)

# SMELL ADDRESSED: Shotgun Surgery
# WHY: If book-related logic needs changes, all modifications happen in this one file. We don't have to hunt through a massive app.py to find scattered book endpoints.

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

        # SMELL ADDRESSED: Defensive Programming
        # WHY: Check if resource exists before attempting update.

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
