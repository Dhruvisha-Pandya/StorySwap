import firebase_admin
from firebase_admin import credentials, firestore
import json
from config import Config

def initialize_firebase():
    firebase_env = Config.FIREBASE_CREDENTIALS
    
    print("🔍 DEBUG: Checking environment variables...")
    print(f"BASE_URL: {Config.BASE_URL}")
    print(f"SENDGRID_API_KEY exists: {bool(Config.SENDGRID_API_KEY)}")
    print(f"FROM_EMAIL exists: {bool(Config.FROM_EMAIL)}")
    print(f"FIREBASE_CREDENTIALS exists: {bool(firebase_env)}")
    
    if firebase_env:
        cred_dict = json.loads(firebase_env)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        print("🔥 Firebase initialized using Render environment")
    else:
        cred = credentials.Certificate("serviceAccount.json")
        firebase_admin.initialize_app(cred)
        print("🔥 Firebase initialized using local serviceAccount.json")
    
    return firestore.client()

db = initialize_firebase()