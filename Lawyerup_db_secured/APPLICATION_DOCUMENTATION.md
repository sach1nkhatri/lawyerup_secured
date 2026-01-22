# ⚖️ LawyerUp Database Secured - Complete Application Documentation

**Version:** 1.0.0  
**Author:** Sachin Khatri  
**License:** MIT  
**Stack:** Node.js · Express · MongoDB · Socket.IO · Security Hardened

---

## 📋 Table of Contents

1. [Application Overview](#application-overview)
2. [Software Architecture](#software-architecture)
3. [Dependencies & Packages](#dependencies--packages)
4. [Security Features](#security-features)
5. [API Endpoints](#api-endpoints)
6. [Database Models](#database-models)
7. [Middleware & Utilities](#middleware--utilities)
8. [Setup & Installation](#setup--installation)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## 🎯 Application Overview

**LawyerUp** is a comprehensive legal tech platform backend API that connects users with lawyers, facilitates legal consultations, manages bookings, and provides AI-powered legal assistance. The application is built with security-first principles, implementing OWASP Top 10 protections and industry-standard security practices.

### Core Features

- ✅ **Secure Authentication** - JWT-based auth with MFA support
- 🔐 **Multi-Factor Authentication** - TOTP (Google Authenticator) support
- 🛡️ **Security Hardened** - Helmet, CSRF, input validation, rate limiting
- 📑 **News Feed** - Like/Dislike/Comment functionality
- 👨‍⚖️ **Lawyer Management** - Lawyer registration, profiles, listings
- 📅 **Booking System** - Appointment scheduling with conflict detection
- 💬 **Real-Time Chat** - Socket.IO-based chat for bookings
- 🤖 **AI Legal Chat** - LM Studio integration for legal assistance
- 🖼️ **Payment Processing** - Manual payment with screenshot verification
- 📄 **PDF Management** - Document upload and review
- 📊 **Admin Dashboard** - Reports, analytics, audit logs
- 🔍 **Audit Logging** - Comprehensive security event logging

---

## 🏗️ Software Architecture

### Project Structure

```
Lawyerup_db_secured/
├── config/
│   └── database.js              # MongoDB connection configuration
├── controllers/                 # Business logic layer
│   ├── adminControlController.js
│   ├── aiController.js
│   ├── analyticsController.js
│   ├── auditController.js
│   ├── authController.js
│   ├── bookingController.js
│   ├── deleteAccountController.js
│   ├── faqController.js
│   ├── lawyerController.js
│   ├── newsController.js
│   ├── paymentController.js
│   ├── pdfController.js
│   ├── reportController.js
│   └── reviewController.js
├── middleware/                  # Security & validation middleware
│   ├── authMiddleware.js        # JWT authentication
│   ├── csrfProtection.js        # CSRF protection
│   ├── inputValidation.js       # Zod-based input validation
│   ├── rateLimiters.js          # Rate limiting (brute force protection)
│   ├── securityHeaders.js       # Helmet security headers
│   ├── uploadMiddleware.js      # Secure file upload handling
│   └── validationSchemas.js    # Validation schemas
├── models/                      # Mongoose schemas
│   ├── Analytics.js
│   ├── AuditLog.js
│   ├── Booking.js
│   ├── chat.js
│   ├── faq.js
│   ├── Lawyer.js
│   ├── News.js
│   ├── payment.js
│   ├── pdf.js
│   ├── PdfVector.js
│   ├── Report.js
│   └── User.js
├── routes/                      # API route definitions
│   ├── adminControlRoutes.js
│   ├── aiRoutes.js
│   ├── analytics.js
│   ├── auditRoutes.js
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── deleteRoutes.js
│   ├── faqRoutes.js
│   ├── LawyerRoutes.js
│   ├── newsRoutes.js
│   ├── paymentRoutes.js
│   ├── pdfRoutes.js
│   ├── reportRoutes.js
│   └── reviewRoutes.js
├── utils/                       # Utility functions
│   ├── analyticsSocket.js
│   ├── analyticsUtils.js
│   ├── auditLogger.js
│   ├── calculateRevenue.js
│   ├── cookieHelpers.js
│   ├── customEncrypter.js
│   ├── embeddingHelper.js
│   ├── generateToken.js
│   ├── passwordPolicy.js
│   ├── resetTrialFlags.js
│   ├── securityLogger.js
│   └── slotUtils.js
├── tests/                       # Test suites
│   ├── model_and_route_test/
│   │   ├── ai.test.js
│   │   ├── auth.test.js
│   │   ├── booking.test.js
│   │   ├── lawyer.test.js
│   │   ├── mfa.test.js
│   │   ├── review.test.js
│   │   └── security.test.js
│   ├── seeds/
│   │   └── securityTestSeeds.js
│   └── SECURITY_TESTING.md
├── uploads/                     # File storage
│   ├── lawyers/
│   ├── news/
│   └── pdf/
├── app.js                       # Express app configuration
├── server.js                    # Server entry point
└── package.json                 # Dependencies
```

### Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB (Mongoose 8.14.3)
- **Real-time:** Socket.IO 4.8.1
- **Security:** Helmet, CSRF, Zod, express-rate-limit
- **Authentication:** JWT (jsonwebtoken), bcryptjs
- **File Upload:** Multer 2.0.0
- **Testing:** Jest, Supertest

---

## 📦 Dependencies & Packages

### Production Dependencies

#### Core Framework
- **express** `^5.1.0` - Web application framework for Node.js
  - *Purpose:* Main HTTP server framework
  - *Usage:* Routes, middleware, request handling

- **mongoose** `^8.14.3` - MongoDB object modeling tool
  - *Purpose:* Database ORM for MongoDB
  - *Usage:* Schema definitions, queries, data validation

#### Security Packages
- **helmet** `^8.1.0` - Security headers middleware
  - *Purpose:* Sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
  - *OWASP:* A05:2021 – Security Misconfiguration
  - *Usage:* Applied globally in app.js

- **csrf** `^3.1.0` - CSRF protection middleware
  - *Purpose:* Prevents Cross-Site Request Forgery attacks
  - *OWASP:* A01:2021 – Broken Access Control
  - *Usage:* Applied to state-changing routes (POST, PUT, DELETE, PATCH)

- **zod** `^4.3.5` - Schema validation library
  - *Purpose:* Runtime type validation and input sanitization
  - *OWASP:* A03:2021 – Injection
  - *Usage:* Input validation middleware, request body validation

- **express-rate-limit** `^8.2.1` - Rate limiting middleware
  - *Purpose:* Prevents brute-force attacks and API abuse
  - *OWASP:* A07:2021 – Identification and Authentication Failures
  - *Usage:* Login endpoint (5/15min), MFA endpoint (5/10min)

- **cookie-parser** `^1.4.7` - Cookie parsing middleware
  - *Purpose:* Parses cookies from request headers
  - *Usage:* Required for httpOnly cookie-based token storage

#### Authentication & Authorization
- **jsonwebtoken** `^9.0.2` - JWT implementation
  - *Purpose:* Token-based authentication
  - *Usage:* Access tokens, MFA tokens

- **bcryptjs** `^3.0.2` - Password hashing
  - *Purpose:* Secure password storage
  - *Usage:* Password hashing, verification

- **speakeasy** `^2.0.0` - TOTP implementation
  - *Purpose:* Multi-factor authentication (MFA)
  - *Usage:* TOTP secret generation, code verification

- **qrcode** `^1.5.4` - QR code generation
  - *Purpose:* Generate QR codes for MFA setup
  - *Usage:* MFA setup flow

#### File Handling
- **multer** `^2.0.0` - File upload middleware
  - *Purpose:* Handle multipart/form-data file uploads
  - *Security:* MIME type validation, file size limits, safe filenames
  - *Usage:* Profile photos, PDFs, payment screenshots, licenses

- **pdf-parse** `^1.1.1` - PDF parsing library
  - *Purpose:* Extract text from PDF files
  - *Usage:* Legal document processing

#### Real-time Communication
- **socket.io** `^4.8.1` - Real-time bidirectional communication
  - *Purpose:* WebSocket-based real-time chat
  - *Usage:* Booking chat, analytics streaming

- **socket.io-client** `^4.8.1` - Socket.IO client library
  - *Purpose:* Client-side Socket.IO connection
  - *Usage:* Testing, client applications

#### HTTP & Networking
- **cors** `^2.8.5` - Cross-Origin Resource Sharing
  - *Purpose:* Enable CORS for frontend applications
  - *Usage:* Configured with credentials support

- **node-fetch** `^3.3.2` - HTTP client
  - *Purpose:* Make HTTP requests
  - *Usage:* LM Studio API calls, external API integration

#### Utilities
- **dotenv** `^16.5.0` - Environment variable management
  - *Purpose:* Load environment variables from .env file
  - *Usage:* Configuration management

- **moment** `^2.30.1` - Date manipulation library
  - *Purpose:* Date formatting and calculations
  - *Usage:* Booking slots, timestamps

- **node-cron** `^4.2.1` - Task scheduler
  - *Purpose:* Schedule recurring tasks
  - *Usage:* Trial flag resets, maintenance tasks

### Development Dependencies

- **jest** `^30.0.5` - JavaScript testing framework
  - *Purpose:* Unit and integration testing
  - *Usage:* Test suites for routes, models, security

- **supertest** `^7.1.4` - HTTP assertion library
  - *Purpose:* Test HTTP endpoints
  - *Usage:* API endpoint testing

- **nodemon** `^3.1.10` - Development server auto-reload
  - *Purpose:* Automatically restart server on file changes
  - *Usage:* Development workflow

### Package Summary

| Category | Count | Key Packages |
|----------|-------|--------------|
| Security | 5 | helmet, csrf, zod, express-rate-limit, cookie-parser |
| Authentication | 4 | jsonwebtoken, bcryptjs, speakeasy, qrcode |
| Core Framework | 2 | express, mongoose |
| File Handling | 2 | multer, pdf-parse |
| Real-time | 2 | socket.io, socket.io-client |
| Testing | 3 | jest, supertest, nodemon |
| Utilities | 4 | dotenv, moment, node-cron, node-fetch |

**Total Dependencies:** 22 production + 3 development = **25 packages**

---

## 🛡️ Security Features

### OWASP Top 10 Protections

#### A01:2021 – Broken Access Control
- ✅ **RBAC (Role-Based Access Control)** - Admin-only routes protected
- ✅ **IDOR Prevention** - Users cannot access other users' resources
- ✅ **CSRF Protection** - State-changing routes protected
- ✅ **Access Denied Logging** - All unauthorized attempts logged

#### A03:2021 – Injection
- ✅ **Input Validation** - Zod schema validation on all inputs
- ✅ **Input Sanitization** - XSS prevention via sanitization
- ✅ **File Upload Security** - MIME type + extension validation (AND logic)
- ✅ **Safe Filenames** - Path traversal prevention

#### A05:2021 – Security Misconfiguration
- ✅ **Security Headers** - Helmet with CSP, HSTS, X-Frame-Options
- ✅ **CORS Configuration** - Properly configured allowed origins
- ✅ **Error Handling** - No sensitive data in error messages
- ✅ **Environment Variables** - Secrets stored in .env

#### A07:2021 – Identification and Authentication Failures
- ✅ **Multi-Factor Authentication** - TOTP-based MFA support
- ✅ **Brute Force Protection** - Account lockout after 5 failed attempts
- ✅ **Rate Limiting** - Login (5/15min), MFA (5/10min)
- ✅ **Strong Password Policy** - Complexity, length, reuse prevention, expiry
- ✅ **Session Security** - httpOnly cookies, SameSite=Strict

### Security Middleware Stack

1. **Helmet** - Security headers (CSP, HSTS, etc.)
2. **CORS** - Cross-origin resource sharing
3. **Cookie Parser** - Secure cookie handling
4. **Input Sanitization** - XSS prevention
5. **CSRF Protection** - State-changing route protection
6. **Rate Limiting** - Brute force protection
7. **Authentication** - JWT token validation
8. **Authorization** - Role-based access control

### Security Logging

- **Audit Logging** - All security-sensitive actions logged
- **Failed Login Attempts** - Tracked and logged
- **Access Denied Events** - Unauthorized access attempts logged
- **MFA Events** - Setup, verification, failures logged
- **Password Changes** - Password modifications logged

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

#### Public Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (rate limited: 5/15min)
- `POST /api/auth/mfa/verify` - MFA verification (rate limited: 5/10min)

#### Protected Endpoints (Requires Auth)
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/update-profile` - Update user profile
- `POST /api/auth/logout` - Logout (clears cookies)
- `POST /api/auth/change-password` - Change password

#### MFA Endpoints
- `POST /api/auth/mfa/setup` - Generate MFA QR code (requires auth)
- `POST /api/auth/mfa/confirm` - Confirm and enable MFA (requires auth)
- `POST /api/auth/mfa/disable` - Disable MFA (requires auth + password)

#### Admin Endpoints (Requires Admin Role)
- `GET /api/auth/users` - Get all users
- `POST /api/auth/register-admin` - Register admin user
- `POST /api/auth/login-admin` - Admin login
- `PATCH /api/auth/status/:userId` - Update user status

### Lawyer Routes (`/api/lawyers`)

- `POST /api/lawyers` - Create lawyer application
- `GET /api/lawyers` - Get all lawyers (public)
- `GET /api/lawyers/:id` - Get lawyer by ID
- `PATCH /api/lawyers/:id` - Update lawyer (auth required)
- `DELETE /api/lawyers/:id` - Delete lawyer (auth required)
- `GET /api/lawyers/by-user` - Get lawyer by email/phone
- `GET /api/lawyers/me` - Get current user's lawyer profile

### Booking Routes (`/api/bookings`)

- `POST /api/bookings` - Create booking (auth required)
- `GET /api/bookings/user/:userId` - Get user's bookings
- `GET /api/bookings/lawyer/:lawyerId` - Get lawyer's bookings
- `GET /api/bookings/slots` - Get available time slots
- `PATCH /api/bookings/:id/status` - Update booking status
- `PATCH /api/bookings/:id/meeting-link` - Add meeting link
- `GET /api/bookings/:id/chat` - Get booking chat messages
- `POST /api/bookings/:id/chat` - Send chat message
- `PATCH /api/bookings/:id/chat/read` - Mark messages as read
- `DELETE /api/bookings/:id` - Delete booking

### AI Chat Routes (`/api/ai`)

- `GET /api/ai/chats` - Get user's chat history (auth required)
- `POST /api/ai/send` - Send message to AI (auth required)
- `POST /api/ai/saveReply` - Save AI response (auth required)
- `DELETE /api/ai/chats/:id` - Delete chat (auth required)

### News Routes (`/api/news`)

- `GET /api/news` - Get all news articles (public)
- `PATCH /api/news/:id/like` - Like article (auth required)
- `PATCH /api/news/:id/unlike` - Unlike article (auth required)
- `PATCH /api/news/:id/dislike` - Dislike article (auth required)
- `PATCH /api/news/:id/undislike` - Remove dislike (auth required)
- `POST /api/news/:id/comment` - Add comment (auth required)
- `DELETE /api/news/:id/comment/:index` - Delete comment (auth required)

### Payment Routes (`/api/manual-payment`)

- `POST /api/manual-payment` - Submit payment screenshot (auth required)
- `GET /api/manual-payment` - Get user's payments (auth required)
- `PATCH /api/manual-payment/:id/approve` - Approve payment (admin only)
- `PATCH /api/manual-payment/:id/reject` - Reject payment (admin only)

### PDF Routes (`/api/pdf`)

- `POST /api/pdf` - Upload PDF document (auth required)
- `GET /api/pdf` - Get user's PDFs (auth required)
- `DELETE /api/pdf/:id` - Delete PDF (auth required)

### Report Routes (`/api/report`)

- `POST /api/report` - Submit report (auth required)
- `GET /api/report` - Get reports (admin only)
- `PATCH /api/report/:id/status` - Update report status (admin only)

### Review Routes (`/api/review`)

- `POST /api/review` - Submit review (auth required)
- `GET /api/review/lawyer/:lawyerId` - Get lawyer reviews (public)

### FAQ Routes (`/api/faq`)

- `GET /api/faq` - Get all FAQs (public)
- `POST /api/faq` - Create FAQ (admin only)
- `PATCH /api/faq/:id` - Update FAQ (admin only)
- `DELETE /api/faq/:id` - Delete FAQ (admin only)

### Admin Control Routes (`/api/admin`)

- `GET /api/admin/reports` - Get all reports (admin only)
- `GET /api/admin/payments` - Get all payments (admin only)
- `GET /api/admin/analytics` - Get analytics data (admin only)
- `PATCH /api/admin/payment/:id/approve` - Approve payment (admin only)
- `PATCH /api/admin/payment/:id/reject` - Reject payment (admin only)

### Audit Routes (`/api/admin`)

- `GET /api/admin/audit-logs` - Get audit logs (admin only)
  - Query params: `action`, `userId`, `ipAddress`, `startDate`, `endDate`, `page`, `limit`

### Analytics Routes (`/api/analytics`)

- `GET /api/analytics` - Get analytics data (admin only)
- WebSocket connection for real-time analytics

### Delete Routes (`/api/delete`)

- `DELETE /api/delete/account` - Delete user account (auth required)
- `PATCH /api/bookings/clear-user-history` - Clear booking history (auth required)
- `DELETE /api/ai/chats/all` - Delete all AI chats (auth required)

---

## 🗄️ Database Models

### User Model
- Authentication fields (email, password hash)
- Profile fields (fullName, contactNumber, address, etc.)
- Security fields (mfaEnabled, mfaSecret, failedLoginAttempts, lockUntil)
- Password policy fields (passwordHistory, passwordChangedAt, passwordExpiresAt)
- Role-based access (role: user, lawyer, admin)

### Lawyer Model
- Profile information (name, email, phone, specialization)
- License information (license number, license file)
- Availability and pricing
- Status (pending, approved, rejected)

### Booking Model
- User and lawyer references
- Date, time, duration
- Status (pending, confirmed, completed, cancelled)
- Meeting link
- Chat messages

### News Model
- Title, content, image
- Likes, dislikes, comments
- Timestamps

### Payment Model
- User reference
- Payment method, plan, duration
- Screenshot file
- Status (pending, approved, rejected)
- Admin approval fields

### PDF Model
- User reference
- File path, filename
- Upload timestamp
- Vector embeddings (for AI search)

### AuditLog Model
- Action type (LOGIN_SUCCESS, LOGIN_FAILED, etc.)
- User ID and role
- IP address and user agent
- Timestamp
- Metadata (JSON)

### Other Models
- **Analytics** - Analytics data storage
- **Report** - User reports
- **Review** - Lawyer reviews
- **FAQ** - Frequently asked questions
- **chat** - Chat message storage

---

## 🔧 Middleware & Utilities

### Security Middleware

#### `authMiddleware.js`
- JWT token validation
- User authentication
- Admin authorization (adminAuth)
- Token extraction from cookies or headers

#### `csrfProtection.js`
- CSRF token generation
- CSRF token verification
- Double Submit Cookie pattern
- Applied to state-changing routes

#### `inputValidation.js`
- Zod-based input validation
- Input sanitization (XSS prevention)
- Common validation schemas (email, password, ObjectId, etc.)

#### `rateLimiters.js`
- Login rate limiter (5 attempts / 15 minutes)
- MFA rate limiter (5 attempts / 10 minutes)
- IP-based rate limiting

#### `securityHeaders.js`
- Helmet configuration
- Content Security Policy (CSP)
- HSTS, X-Frame-Options, etc.

#### `uploadMiddleware.js`
- Multer configuration
- File type validation (MIME + extension)
- File size limits
- Safe filename generation

### Utility Functions

- **auditLogger.js** - Security event logging
- **passwordPolicy.js** - Password validation and policy enforcement
- **cookieHelpers.js** - Cookie management utilities
- **generateToken.js** - JWT token generation
- **slotUtils.js** - Booking slot conflict detection
- **analyticsUtils.js** - Analytics calculations
- **embeddingHelper.js** - PDF text embedding for AI search

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd Lawyerup_db_secured
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lawyerup

   # JWT Secrets
   JWT_SECRET=your_jwt_secret_key_here
   MFA_JWT_SECRET=your_mfa_jwt_secret_key_here

   # CORS (comma-separated)
   ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

   # LM Studio (for AI chat)
   LM_STUDIO_URL=http://localhost:1234
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `MFA_JWT_SECRET` | Yes | Secret for MFA token signing |
| `ALLOWED_ORIGINS` | No | Comma-separated list of allowed CORS origins |
| `NODE_ENV` | No | Environment (development/production) |

---

## 🧪 Testing

### Test Structure

- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **Security Tests** - Security vulnerability testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- security.test.js

# Run with coverage
npm test -- --coverage
```

### Security Test Suite

The security test suite (`tests/model_and_route_test/security.test.js`) includes:

- **Brute Force Protection** - Account lockout testing
- **MFA Code Guessing** - Rate limiting and logging
- **IDOR Prevention** - Unauthorized access testing
- **Access Denied Logging** - Audit log verification
- **Rate Limiting** - Endpoint rate limit testing
- **Password Expiry** - Expired password handling

See `tests/SECURITY_TESTING.md` for detailed security testing documentation.

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in environment
- [ ] Configure `ALLOWED_ORIGINS` with production domains
- [ ] Use strong `JWT_SECRET` and `MFA_JWT_SECRET`
- [ ] Enable MongoDB connection pooling
- [ ] Configure file upload size limits
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Review security headers configuration

### Recommended Production Setup

1. **Reverse Proxy** (nginx)
   - SSL termination
   - Rate limiting
   - Static file serving

2. **Process Manager** (PM2)
   ```bash
   npm install -g pm2
   pm2 start server.js --name lawyerup-api
   ```

3. **MongoDB Atlas**
   - Use MongoDB Atlas for managed database
   - Configure IP whitelist
   - Enable backup and monitoring

4. **Monitoring**
   - Application monitoring (New Relic, Datadog)
   - Error tracking (Sentry)
   - Log aggregation (ELK stack)

---

## 📊 API Response Formats

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": "ERROR_CODE"
}
```

### Authentication Response
```json
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

### MFA Required Response
```json
{
  "mfaRequired": true,
  "mfaToken": "mfa_jwt_token",
  "userId": "user_id",
  "email": "user@example.com"
}
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Use environment variables
2. **Use strong secrets** - Generate random strings for JWT secrets
3. **Enable HTTPS** - Always use SSL/TLS in production
4. **Regular updates** - Keep dependencies updated
5. **Monitor audit logs** - Review security events regularly
6. **Rate limiting** - Protect all public endpoints
7. **Input validation** - Validate and sanitize all inputs
8. **Error handling** - Don't expose sensitive information in errors

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👤 Author

**Sachin Khatri**  
Project: LawyerUp – Legal Assistant for Everyone  
Stack: Node.js · Express · MongoDB · Socket.IO · Security Hardened

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅


