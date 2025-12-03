# StorySwap – A Physical Book Networking Platform

StorySwap is a web application that allows users to **share, lend, borrow, and exchange physical books** within their community.  
It provides a smooth experience for listing books, browsing books uploaded by others, requesting books, managing profiles, and tracking book requests — all inside a clean, modern React UI.

---

## Overview

StorySwap aims to make the process of exchanging physical books simple and user-friendly.  
Users can:

- Upload their books with cover images (stored in Firestore as Base64)
- Request a book from another user (email notifications supported)
- Manage their profile
- View sent and received requests
- Switch between light and dark themes

The application is built using **React**, **Firebase**, and a lightweight **Flask backend** (for sending email notifications via SendGrid).

---

## Features

### 1. User Authentication

- Email/password signup & login
- Firebase Authentication
- Email verification support

### 2. Book Management

- Upload/edit/delete book listings
- Base64 image storage (no Firebase Storage required)
- “My Books” dashboard
- Consistent UI using reusable `BookCard` components

### 3. Book Request System

- Borrowers can request a book directly from the book card
- Lenders receive an email with **Accept** / **Decline** links
- Requests stored in Firestore
- Borrowers and lenders can view request history

### 4. Theme Support

- Light and dark theme toggle via custom `useTheme` hook

### 5. Profile Management

- Upload/remove profile picture (Base64)
- Update username, email, and password
- View sent book requests

### 6. Responsive UI

- Fully responsive navbar
- Mobile-friendly layout
- Clean, modern CSS

---

## Tech Stack

### **Frontend**

- **React.js**
- React Router DOM
- Custom Hooks
- CSS modules / custom CSS
- React Icons
- Hosted on Vercel

### **Backend**

- **Flask** (lightweight email request API)
- SendGrid Email API
- CORS enabled API endpoints
- Environment variables managed with `dotenv`
- Deployed on Render
- Minimal Flask app to handle email requests

### **Database**

- **Firebase Firestore**
- Stores users, books, requests, Base64 images

### **Authentication**

- Firebase Authentication
- Email verification
- Password-based login

### **Third-Party APIs / Tools**

- **SendGrid** — used for sending book request emails
- **Firebase SDKs** (Auth, Firestore)
- **dotenv** for backend environment variables

---

### **Project Structure**

```
STORYSWAP/
│
├── frontend/
├── Backend/
├── README.md
├── package.json
├── venv
```

### **Backend Structure**

```
backend/
│── routes/
│   ├── auth.py
│   ├── books.py
│   ├── debug.py
│   ├── email.py
│   └── __init__.py
│
│── services/
│   ├── email_service.py
│   └── __init__.py
│
│── utils/
│   └── firebase_admin.py
│
│── serviceAccount.json
│── firebase_config.py
│── config.py
│── app.py
│── requirements.txt
│── Procfile
│── .env
│── .gitignore
```

### **Frontend Structure**

```
frontend/
│── public/
│
│── src/
│
│   ├── components/
│   │   ├── footer/
│   │   │   └── Footer.jsx
│   │   ├── mybooks/
│   │   │   ├── BookModal.jsx
│   │   │   ├── BookUploadForm.jsx
│   │   │   └── MyBooks.jsx
│   │   ├── navbar/
│   │   │   └── Navbar.jsx
│   │   └── profile/
│   │       ├── ProfileModal.jsx
│   │       └── RequestedBooks.jsx
│
│   ├── firebase/
│   │   └── firebase.js
│
│   ├── hooks/
│   │   ├── useAutoUpdateLocation.js
│   │   └── useTheme.js
│
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Welcome.jsx
│   │   ├── home/
│   │   │   ├── HeroCarousel.jsx
│   │   │   └── Home.jsx
│   │   └── search/
│   │       ├── BookDetailModal.jsx
│   │       └── SearchResults.jsx
│
│   ├── static/
│   │   ├── auth/
│   │   ├── footer/
│   │   ├── home/
│   │   ├── mybooks/
│   │   ├── navbar/
│   │   └── profile/
│
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   ├── Logo.jpg
│   ├── reportWebVitals.js
│   └── setupTests.js
│
│── .env
│── .gitignore
│── package.json
│── package-lock.json
```

---

## Installation & Setup (Windows)

Follow these steps to run StorySwap locally on Windows.

---

## 1 Clone the Repository

```bash
git clone https://github.com/Dhruvisha-Pandya/storyswap.git
cd storyswap
```

---

## 2 Backend Setup (Flask API)

### Create & Activate Virtual Environment

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
```

### Install Dependencies

```powershell
pip install -r requirements.txt
```

### Create Backend `.env`

Create a file named **`.env` inside the `backend/` folder**:

```
FLASK_APP=app.py
FLASK_ENV=development
PORT=5000

# SendGrid (Email Service)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM=your_verified_sender_email@example.com

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# CORS
CORS_ORIGINS=http://localhost:3000
```

> **Firebase will give `serviceAccount.json`, place it inside `/backend` but DO NOT commit it.**

### Start Backend Server

```powershell
python app.py
```

Backend will run on:

```
http://localhost:5000
```

---

## 3 Frontend Setup (React)

Open a new terminal window:

### Install Dependencies

```powershell
cd frontend
npm install
```

### Create Frontend `.env`

Create **`frontend/.env`**:

```
REACT_APP_API_BASE_URL=http://localhost:5000

# Firebase Config (only if your firebase.js reads from env)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

### Start Frontend

```powershell
npm start OR npm run dev
```

App opens automatically at:

```
http://localhost:3000
```

---

## 4 Verify Setup

1. Start **backend** - `python app.py`
2. Start **frontend** - `npm start`
3. Open **http://localhost:3000**
4. Test:
   - Register
   - Login
   - Upload book
   - Send request to lender (SendGrid email)

---

## 5 Build for Production

### Frontend Build

```powershell
cd frontend
npm run build
```

### Backend Deployment

- Use Render/Heroku/AWS — make sure all environment variables (Firebase + SendGrid) are added in dashboard.
- I've used Render for backend deployment.

---

## 6 Important Notes

- Never commit `.env` or `serviceAccount.json`.
- Ensure `SENDGRID_FROM` email is **verified** in SendGrid.

---

## Contributing

Contributions are welcome. Please open issues or PRs describing the change. Follow standard branching workflows (feature branches → PR → review → merge).

---

## Contact

For questions or help contact on pandyadhruvisha@gmail.com
