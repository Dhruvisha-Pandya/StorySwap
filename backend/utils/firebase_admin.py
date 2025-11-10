import firebase_admin
from firebase_admin import credentials, auth, firestore

# Firebase service account key:
# Firebase Console → Project Settings → Service Accounts → Generate Key
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()  # Firestore DB