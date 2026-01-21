# ⚖️ LawyerUp Backend API

LawyerUp is a full-stack legal tech platform designed to empower users with easy legal access. This repository contains the backend API built using **Node.js**, **Express**, and **MongoDB**, powering core features like authentication, lawyer management, booking system, chat, AI integration, and manual payment verification.

---

## 🚀 Features

- ✅ JWT Authentication (Login, Register, Profile)
- 📑 News Feed with Like/Dislike/Comment
- 👨‍⚖️ Lawyer Join Form and Listings
- 📅 Booking System with Slot Conflict Detection
- 💬 Real-Time Chat via Socket.IO
- 🤖 AI Legal Chat using LM Studio API
- 🖼️ Manual Payment with Screenshot Upload
- 📄 PDF Uploads for Legal Document Review
- 📊 Admin Control: Reports, Manual Payments, Analytics

---

## 📁 Project Structure

```
LawyerUp_db_backend/
├── controllers/       # API logic
├── models/            # Mongoose schemas
├── routes/            # Route declarations
├── middlewares/       # Auth & error middleware
├── utils/             # Slot conflict, helpers
├── uploads/           # File storage (PDFs, images, licenses)
├── .env               # Environment variables
├── server.js          # Main app entry point
└── ...
```

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/LawyerUp_db_backend.git
cd LawyerUp_db_backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env` File

```env
PORT=5000
MONGO_URI=mongodb+srv://your_mongodb_url
JWT_SECRET=your_jwt_secret
MFA_JWT_SECRET=your_mfa_jwt_secret_for_totp_verification
```

### 4. Run the Development Server

```bash
npm run dev
```

---

## 🔌 Centralized API & Socket Configuration

In your Flutter app, all backend URLs are stored in:

```dart
lib/app/constant/api_endpoints.dart
```

```dart
static const String baseHost = "http://192.168.1.85:5000";
static const String socketUrl = "http://192.168.1.85:5000";
static const String lmStudioBase = "http://192.168.1.85:1234";
```

Change these once to update across your entire app.

---

## 📡 Socket.IO – Realtime Booking Chat

### ✅ Server

Socket.IO is set up in the backend to:
- Join chat room via `bookingId`
- Send and receive messages

### ✅ Flutter Client

```dart
_socket = IO.io(ApiEndpoints.socketUrl, <String, dynamic>{
  'transports': ['websocket'],
  'autoConnect': false,
});

_socket.connect();

_socket.onConnect((_) {
  _socket.emit('joinRoom', bookingId);
});
```

---

## 📸 Manual Payment Upload

```http
POST /api/manual-payment
```

- Send payment method, plan, duration
- Attach screenshot (image/pdf)
- Admin approves via:

```http
PATCH /api/manual-payment/:id/approve
PATCH /api/manual-payment/:id/reject
```

---

## 🤖 AI Chat Integration (LM Studio)

- Uses LM Studio locally at `http://localhost:1234`
- POST chat prompt to `/v1/chat/completions`
- Saves responses to MongoDB

---

## 🛡️ Auth Routes

```http
POST   /api/auth/login
POST   /api/auth/signup
GET    /api/auth/me
PATCH  /api/auth/update-profile
```

### 🔐 Multi-Factor Authentication (MFA) Routes

LawyerUp supports TOTP-based MFA using Google Authenticator or similar apps.

**Setup Flow:**
1. **POST /api/auth/mfa/setup** (requires auth)
   - Generates TOTP secret and QR code
   - Returns `qrCodeDataUrl` and `otpauth_url`
   - Scan QR code with authenticator app

2. **POST /api/auth/mfa/confirm** (requires auth)
   - Body: `{ "code": "123456" }` (6-digit TOTP code)
   - Verifies TOTP code and enables MFA
   - Returns recovery codes (save these securely!)

**Login Flow (when MFA is enabled):**
1. **POST /api/auth/login** (normal login)
   - If MFA enabled, returns: `{ mfaRequired: true, mfaToken: "...", userId, email }`
   - If MFA disabled, returns normal token

2. **POST /api/auth/mfa/verify** (no normal auth required)
   - Body: `{ "mfaToken": "...", "code": "123456" }` OR `{ "mfaToken": "...", "recoveryCode": "ABC12345" }`
   - Verifies TOTP code or recovery code
   - Returns normal access token

**Disable MFA:**
- **POST /api/auth/mfa/disable** (requires auth)
  - Body: `{ "password": "...", "code": "123456" }` OR `{ "password": "...", "recoveryCode": "ABC12345" }`
  - Requires password + TOTP code OR recovery code

---

## 🧑‍⚖️ Lawyer Routes

```http
POST   /api/lawyers
GET    /api/lawyers
GET    /api/lawyers/:id
PATCH  /api/lawyers/:id
DELETE /api/lawyers/:id
GET    /api/lawyers/by-user
GET    /api/lawyers/me
```

---

## 📅 Booking Routes

```http
POST   /api/bookings
GET    /api/bookings/user/:userId
GET    /api/bookings/lawyer/:lawyerId
GET    /api/bookings/slots
PATCH  /api/bookings/:id/status
PATCH  /api/bookings/:id/meeting-link
GET    /api/bookings/:id/chat
POST   /api/bookings/:id/chat
PATCH  /api/bookings/:id/chat/read
DELETE /api/bookings/:id
```

---

## 💬 AI Chat Routes

```http
GET     /api/ai/chats
POST    /api/ai/send
POST    /api/ai/saveReply
DELETE  /api/ai/chats/:id
```

---

## 📰 News Routes

```http
GET     /api/news
PATCH   /api/news/:id/like
PATCH   /api/news/:id/unlike
PATCH   /api/news/:id/dislike
PATCH   /api/news/:id/undislike
POST    /api/news/:id/comment
DELETE  /api/news/:id/comment/:index
```

---

## 🛠️ Danger Zone API

```http
PATCH /api/bookings/clear-user-history
DELETE /api/ai/chats/all
DELETE /api/delete/account
```

---

## 📮 Report API

```http
POST   /api/report
GET    /api/report
PATCH  /api/report/:id/status
```

---

## 🧠 Contribution Guide

- Follow existing folder structure.
- Keep routes RESTful.
- Test all changes using Postman before pushing.
- Use `.env` to protect secrets.

---

## 🧪 Testing Tips

- Use Postman for JWT-secured routes.
- Make sure MongoDB is running locally or Atlas is configured.
- LM Studio must be running for AI chat to function.

---

## 📜 License

MIT License — free to use with attribution.

---

## ✨ Author

Made with ❤️ by **Sachin Khatri**  
**Project:** LawyerUp – Legal Assistant for Everyone  
**Stack:** Node.js · Express · MongoDB · Socket.IO · LM Studio · Flutter
