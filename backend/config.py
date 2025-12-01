import os
from dotenv import load_dotenv

load_dotenv()

''' 
SMELL ADDRESSED: Magic Strings & Hardcoded Values
 WHY: Scattered configuration makes changes risky and error-prone.
 Configuration should be centralized so changes happen in one place,
 reducing the chance of inconsistencies across the application.

 SMELL ADDRESSED: Duplicate Code
 WHY: Without a Config class, we'd call os.getenv() repeatedly throughout
 the codebase, violating DRY (Don't Repeat Yourself). This creates
 maintenance burden when environment variable names change.

 SMELL ADDRESSED: Poor Testability
 WHY: Centralizing config makes it easy to mock/override values during testing
 without modifying multiple files or using complex patching strategies.'''

class Config:
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY')
    BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5000")
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    FROM_EMAIL = os.getenv("FROM_EMAIL")
    FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS")
    PORT = int(os.environ.get('PORT', 5000))
    TEST_EMAIL = os.getenv("TEST_EMAIL", "pandyadhruvisha@gmail.com")
    
"""BENEFIT: Single Responsibility Principle (SRP)
This class has ONE job: provide configuration.
It doesn't mix business logic with configuration concerns."""