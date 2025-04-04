from flask import Flask, send_from_directory
import firebase_admin
from firebase_admin import credentials
import os

cred = credentials.Certificate("serviceAccount.json")
firebase_admin.initialize_app(cred)
print("🔥 Firebase connection successful!")

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')
print("🔑 Flask secret key loaded:", bool(app.config['SECRET_KEY']))

# Serve React's static files (for production)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    return send_from_directory('../frontend/build', 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)