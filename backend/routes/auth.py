from flask import Blueprint, request, jsonify
from firebase_admin import auth as firebase_auth

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    id_token = request.json.get('token')
    
    if not id_token:
        return jsonify({"error": "Missing token"}), 400

    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        return jsonify({"success": True, "uid": decoded_token['uid']})
    except Exception as e:
        return jsonify({"error": str(e)}), 401
