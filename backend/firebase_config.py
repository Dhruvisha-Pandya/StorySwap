import firebase_admin
from firebase_admin import credentials, firestore
import json
from config import Config

'''SMELL ADDRESSED: God Object / Bloated Module
 WHY: Keeping Firebase initialization in app.py creates a "God file" that
 knows too much and does too much. Separation allows each module to have
 a clear, focused purpose.

 SMELL ADDRESSED: Tight Coupling
 WHY: By isolating Firebase setup, we can change the database implementation
 without touching route handlers. Routes depend on 'db', not on how it's created.

 SMELL ADDRESSED: Difficult Testing
 WHY: Separating initialization makes it possible to mock the database
 in tests without initializing the entire Flask app.'''

def initialize_firebase():
    """
    Initialize Firebase Admin SDK based on environment.
    
    DESIGN DECISION: Function over inline code
    WHY: Encapsulation allows us to control when/how Firebase is initialized.
    This is crucial for testing scenarios where we might want to delay or
    mock initialization.
    """
    firebase_env = Config.FIREBASE_CREDENTIALS
    
    # SMELL ADDRESSED: Silent Failures
    # WHY: Debug prints provide visibility into configuration state.
    # In production systems, this would be proper logging with levels.
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

'''SMELL ADDRESSED: Hidden Dependencies
 WHY: Exporting 'db' makes the dependency explicit. Any module importing
 this knows it's getting a database connection, improving code readability.'''
db = initialize_firebase()