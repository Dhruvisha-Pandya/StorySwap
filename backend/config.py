import os
from dotenv import load_dotenv

load_dotenv()

''' 
SMELL ADDRESSED: Magic Strings & Hardcoded Values
  SMELL ADDRESSED: Duplicate Code
 SMELL ADDRESSED: Poor Testability'''

class Config:
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY')
    BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5000")
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    FROM_EMAIL = os.getenv("FROM_EMAIL")
    FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS")
    PORT = int(os.environ.get('PORT', 5000))
    TEST_EMAIL = os.getenv("TEST_EMAIL", "pandyadhruvisha@gmail.com")
    
#design principle: Single Responsibility Principle (SRP)