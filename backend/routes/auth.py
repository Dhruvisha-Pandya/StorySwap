from flask import request, jsonify
from firebase_admin import auth

@app.route('/api/verify-token', methods=['POST'])
def verify_token():
    id_token = request.json.get('token')
    try:
        decoded_token = auth.verify_id_token(id_token)
        return jsonify({"success": True, "uid": decoded_token['uid']})
    except Exception as e:
        return jsonify({"error": str(e)}), 401