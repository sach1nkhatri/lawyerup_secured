# LawyerUp Security Documentation

This document outlines the security features and updates implemented in the LawyerUp platform. The project follows OWASP Top 10 security guidelines and implements industry-standard security practices to protect user data and prevent common web vulnerabilities.

## Project Overview

LawyerUp is a legal tech platform that connects users with lawyers, facilitates consultations, manages bookings, and provides AI-powered legal assistance. The application consists of a Node.js backend API and a React frontend, both built with security as a primary concern.

## Security Features Implemented

### Authentication and Authorization

**JWT-Based Authentication**
- Access tokens stored in httpOnly cookies instead of localStorage
- Tokens include user ID and expiry time
- Secure cookie flags: httpOnly, SameSite=Strict, secure flag in production
- Prevents XSS attacks from stealing tokens since JavaScript cannot access httpOnly cookies

**Multi-Factor Authentication (MFA)**
- TOTP-based MFA using Google Authenticator or similar apps
- QR code generation for easy setup
- Recovery codes provided during MFA setup for account recovery
- MFA verification required after login if enabled
- Rate limiting on MFA verification endpoint (5 attempts per 10 minutes)

**Password Security**
- Passwords hashed using bcryptjs with 10 rounds
- Password complexity requirements enforced:
  - Minimum 8 characters, maximum 128 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Password history prevents reuse of last 5 passwords
- Password expiry after 90 days with forced password change
- Account lockout after 5 failed login attempts for 30 minutes

**Role-Based Access Control (RBAC)**
- Three user roles: user, lawyer, admin
- Admin-only routes protected with adminAuth middleware
- Users cannot access other users' resources (IDOR prevention)
- Authorization checks enforced on all protected endpoints

### OWASP Top 10 Protections

**A01:2021 - Broken Access Control**
- RBAC implementation for role-based permissions
- IDOR prevention - users cannot access other users' data
- CSRF protection on all state-changing routes
- Access denied events logged for security monitoring

**A03:2021 - Injection**
- Zod schema validation on all input data
- Input sanitization to prevent XSS attacks
- File upload security with MIME type and extension validation
- Safe filename generation to prevent path traversal attacks

**A05:2021 - Security Misconfiguration**
- Security headers configured using Helmet middleware
- Content Security Policy (CSP) to prevent XSS
- HSTS (HTTP Strict Transport Security) enabled
- X-Frame-Options prevents clickjacking
- X-Content-Type-Options prevents MIME sniffing
- CORS configured with whitelist of allowed origins
- Error messages sanitized to not expose sensitive information
- Environment variables used for secrets (never hardcoded)

**A07:2021 - Identification and Authentication Failures**
- Multi-factor authentication support
- Brute force protection with account lockout
- Rate limiting on login (5 attempts per 15 minutes)
- Rate limiting on MFA verification (5 attempts per 10 minutes)
- Strong password policy with complexity requirements
- Password expiry and history enforcement
- Secure session management with httpOnly cookies

### CSRF Protection

- Double Submit Cookie pattern implementation
- CSRF tokens generated and verified on state-changing routes (POST, PUT, DELETE, PATCH)
- Token stored in httpOnly cookie and sent in X-CSRF-Token header
- Public endpoints excluded (login, signup, MFA verify)
- All CSRF validation failures logged for security monitoring

### Rate Limiting

- Login endpoint: 5 attempts per 15 minutes per IP address
- MFA verification: 5 attempts per 10 minutes per IP address
- IP-based rate limiting with proper IPv6 handling
- Rate limit information included in response headers
- User-friendly error messages with retry-after information

### File Upload Security

- Multer middleware for secure file handling
- MIME type validation AND file extension validation (both must match)
- File size limits: 5MB for images, 10MB for PDFs
- Filenames sanitized to prevent path traversal
- Dangerous characters removed from filenames
- Uploaded files stored in secure directories

### Security Headers

The application uses Helmet middleware to set the following security headers:
- Content-Security-Policy: Controls resource loading to prevent XSS
- X-DNS-Prefetch-Control: Controls DNS prefetching
- X-Frame-Options: Prevents clickjacking attacks
- X-Content-Type-Options: Prevents MIME type sniffing
- Referrer-Policy: Controls referrer information
- Permissions-Policy: Controls browser features
- HSTS: Forces HTTPS connections
- Hide Powered-By: Removes Express version disclosure

### Input Validation and Sanitization

- Zod schemas for all input types (email, password, ObjectId, etc.)
- Input sanitization middleware removes XSS attempts
- Validation applied before controllers process requests
- Type checking and format validation on all user inputs

### Audit Logging

- Comprehensive security event logging
- All security-sensitive actions logged:
  - Login attempts (success and failure)
  - MFA setup and verification
  - Password changes
  - Access denied events
  - CSRF validation failures
- Logs include: user ID, role, IP address, user agent, timestamp, action type
- Admin can view audit logs via /api/admin/audit-logs endpoint
- Helps identify attack patterns and investigate security incidents

### CORS Configuration

- Whitelist-based CORS configuration
- Only allowed origins can make requests to the API
- Credentials enabled for cookie support
- Configured via ALLOWED_ORIGINS environment variable
- Supports comma-separated list of domains

### Frontend Security Updates

**Cookie-Based Authentication**
- Axios configured with withCredentials: true to send httpOnly cookies
- All API calls use axiosInstance instead of plain axios
- Token storage removed from localStorage (now in httpOnly cookies)
- Private routes verify authentication via /api/auth/me endpoint

**MFA Integration**
- MFA verification component for login flow
- MFA setup component in settings page
- QR code display for authenticator app setup
- Recovery code handling

**Password Management**
- Password change modal with strength meter
- Client-side password validation matching backend policy
- Password expiry warnings in login flow
- Visual password strength indicator

**Error Handling**
- Error interceptor handles security events:
  - Account lockout (423 status)
  - Rate limiting (429 status)
  - Password expired (403 status)
- User-friendly error messages
- Proper handling of retry-after headers

**CSRF Token Handling**
- CSRF token interceptor automatically includes X-CSRF-Token header
- Reads CSRF token from _csrf_token cookie
- Applied to all state-changing requests

## Security Testing

The project includes a comprehensive security test suite that validates:
- Brute force protection (account lockout after 5 attempts)
- MFA code guessing protection (rate limiting)
- IDOR prevention (unauthorized access testing)
- Access denied logging (audit log verification)
- Rate limiting (endpoint rate limit testing)
- Password expiry (expired password handling)

Tests can be run using:
```bash
npm test -- security.test.js
```

## Security Best Practices

1. Never commit .env file - use environment variables for secrets
2. Use strong secrets - generate random strings for JWT secrets
3. Enable HTTPS - always use SSL/TLS in production
4. Regular updates - keep dependencies updated
5. Monitor audit logs - review security events regularly
6. Rate limiting - protect all public endpoints
7. Input validation - validate and sanitize all inputs
8. Error handling - don't expose sensitive information in errors

## Environment Variables

Required environment variables for security:
- PORT: Server port
- MONGO_URI: MongoDB connection string
- JWT_SECRET: Secret for JWT token signing
- MFA_JWT_SECRET: Secret for MFA token signing
- ALLOWED_ORIGINS: Comma-separated list of allowed CORS origins
- NODE_ENV: Environment (development/production)

## Project Structure

The security features are implemented across multiple layers:

- **Middleware**: Security headers, CSRF protection, rate limiting, input validation, authentication
- **Controllers**: Authorization checks, audit logging
- **Models**: Password hashing, MFA secrets, security fields
- **Utils**: Password policy, audit logger, cookie helpers
- **Routes**: Protected routes with authentication and authorization middleware

## Conclusion

This project implements comprehensive security measures following OWASP Top 10 guidelines. The security features are integrated throughout the application stack, from middleware to controllers, ensuring defense in depth. Regular security testing and audit log monitoring help maintain the security posture of the application.

