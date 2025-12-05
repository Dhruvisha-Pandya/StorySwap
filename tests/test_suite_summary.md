# Test Suite Summary

This document provides a structured overview of all unit tests included in the project.  
The tests are grouped by file and aligned with their corresponding application modules.

---

## 1. `conftest.py` – Global Test Setup

### **Purpose**

Provides shared fixtures and mocks for all test files.

### **Key Features**

#### **Adds backend directory to `sys.path`**

#### **Mocks**

- `firebase_admin`, `firestore`, `auth`
- `firebase_config`
- `Config` object (including secrets, API keys, etc.)

#### **Registers Blueprints**

- `books_bp`
- `email_bp` (`/api`)
- `auth_bp` (`/api`)

#### **Fixtures**

- **`app`** – creates Flask app instance with testing enabled
- **`client`** – provides Flask test client
- **`mock_db`** – patches Firestore (`routes.books.db`)
- **`mock_send_email`** – patches SendGrid wrapper (`send_email`)
- **`mock_auth`** – patches Firebase auth (`firebase_auth`)

---

## 2. `test_auth.py` – Tests for `auth.py`

### **Test: Valid Token**

- Mocks `firebase_auth.verify_id_token` to return a UID
- Ensures `/api/verify-token` returns:
  - **200 OK**
  - `{ "success": true, "uid": "user_123" }`

### **Test: Invalid Token**

- Mocks token validation to raise error
- Expects:
  - **401 Unauthorized**
  - Error message containing `"Invalid token"`

---

## 3. `test_config.py` – Tests for Config Handling

### **Test: Environment Variables Load**

- Uses MonkeyPatch to simulate `.env` values
- Verifies all config values load correctly

### **Test: Production Config**

- Ensures `Config.DEBUG == False` when running in production

---

## 4. `test_routes.py` – Tests for Books & Email Routes

---

### **BOOK ROUTES** (`books.py`)

#### **Test: Add Book Success**

- Sends valid book JSON
- Expects:
  - **200 OK**
  - `collection('books').add()` called

#### **Test: Missing Required Fields**

- Missing fields → returns:
  - **400 Bad Request**
  - `"Missing fields"` message

#### **Test: Get Books by Owner**

- Mocks `.where().stream()` to return sample doc
- Expects correct JSON output

#### **Test: Update Book Success**

- Document exists
- Expects:
  - **200 OK**
  - `.update()` called with updated data

#### **Test: Delete Book – Not Found**

- Missing document
- Returns:
  - **404 Not Found**

#### **Test: Delete Book – Success**

- Document exists → `.delete()` called
- Returns:
  - **200 OK**

#### **Test: Update Book – Not Found**

- Missing document → **404 Not Found**

#### **Test: Missing Query Parameter**

- `/get-books` without `ownerId` → **400 Bad Request**

#### **Test: Add Book – DB Failure**

- Firestore throws exception (“Firebase Down”)
- Returns:
  - **500 Internal Server Error**

---

### **EMAIL ROUTES** (`email.py`)

#### **Test: Send Request Email Success**

- Valid JSON payload
- Expects:
  - **200 OK**
  - Correct subject + email content

#### **Test: Accept Response**

- `/api/respond-request?action=accept&...`
- Borrower receives **ACCEPTED** email

#### **Test: Missing Email Fields**

- Missing JSON → **400 Bad Request**

#### **Test: Decline Response**

- Borrower receives **DECLINED ❌** email

---

## 5. `test_services.py` – Tests for `email_service.py`

### **Test: Send Email Success**

- Mocks SendGrid
- Expects:
  - **202 Accepted**
  - Correct headers, JSON format

### **Test: Missing Config**

- Missing API key → return `False`
- Ensures `requests.post` is **never called**

### **Test: SendGrid API Error**

- Mock SendGrid returns 400
- Function returns `False`

---

## Final Notes

This test suite provides strong coverage across all major modules:

| Module            | Areas Tested                                        |
| ----------------- | --------------------------------------------------- |
| **Auth**          | Token validation, Firebase error handling           |
| **Books**         | CRUD operations, Firestore interactions, edge cases |
| **Email Routes**  | Request/response workflow, SendGrid handling        |
| **Email Service** | API formatting, config validation, error responses  |
| **Config**        | Env variable loading, production sanity checks      |

**Overall: Excellent coverage across routes, services, and configuration layers.**
