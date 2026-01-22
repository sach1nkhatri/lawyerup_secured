# MFA (Multi-Factor Authentication) Setup Guide

## Overview

LawyerUp uses **TOTP (Time-based One-Time Password)** for MFA, which works with authenticator apps like Google Authenticator, Authy, Microsoft Authenticator, etc. **No email setup is required** - everything is done through QR codes.

---

## How MFA Works

1. **User enables MFA** → System generates a secret key
2. **User scans QR code** → Secret is stored in their authenticator app
3. **User confirms with 6-digit code** → MFA is enabled
4. **On login** → User enters password + 6-digit code from app
5. **Recovery codes** → Backup codes if user loses access to authenticator

---

## Testing MFA - Step by Step

### Step 1: Create a Test Account

1. **Sign up** at `http://localhost:3000/login`
   - Use any email (e.g., `test@example.com`)
   - Password must meet requirements:
     - At least 8 characters
     - Uppercase, lowercase, number, special character
   - Example: `Test@1234`

2. **Login** with your new account

### Step 2: Enable MFA

1. **Go to Settings** → `/dashboard/settings`
2. **Click "Enable Two-Factor Authentication"** button
3. **QR Code appears** - You'll see:
   - QR code image
   - Secret key (for manual entry)

### Step 3: Install Authenticator App

**Choose one:**
- **Google Authenticator** (iOS/Android) - Most common
- **Authy** (iOS/Android/Desktop) - Cloud backup
- **Microsoft Authenticator** (iOS/Android)
- **1Password** (if you use it)

**Install on your phone:**
- iOS: App Store → Search "Google Authenticator"
- Android: Play Store → Search "Google Authenticator"

### Step 4: Scan QR Code

1. **Open authenticator app** on your phone
2. **Tap "+" or "Add account"**
3. **Select "Scan QR code"**
4. **Point camera at QR code** on screen
5. **Account added!** You'll see "LawyerUp Secure (your-email)" with a 6-digit code

### Step 5: Confirm MFA Setup

1. **Enter the 6-digit code** from your authenticator app
2. **Click "Verify & Enable"**
3. **Save recovery codes** - These are shown ONCE only!
   - Copy them somewhere safe
   - Use them if you lose access to your phone

### Step 6: Test MFA Login

1. **Logout** from your account
2. **Login again** with email + password
3. **MFA prompt appears** - Enter 6-digit code from app
4. **Success!** You're logged in

---

## Testing Scenarios

### ✅ Test 1: Normal MFA Flow
- Enable MFA → Scan QR → Confirm → Login with MFA code

### ✅ Test 2: Recovery Code
- Login → Use recovery code instead of TOTP code

### ✅ Test 3: Wrong Code
- Try wrong 6-digit code → Should fail with error

### ✅ Test 4: Rate Limiting
- Try wrong code 5 times → Should be rate limited

### ✅ Test 5: Disable MFA
- Settings → Disable MFA → Login should work without MFA

---

## Troubleshooting

### QR Code Not Scanning?
- **Manual entry**: Copy the secret key shown below QR code
- **Enter manually** in authenticator app:
  - Account name: `LawyerUp Secure (your-email)`
  - Secret: (paste the base32 secret)

### Code Not Working?
- **Check time sync**: Authenticator app and server must have correct time
- **Try next code**: Codes refresh every 30 seconds
- **Window tolerance**: System allows ±60 seconds (2 time steps)

### Lost Recovery Codes?
- **Contact support** (if implemented)
- **Or**: Disable MFA and re-enable to get new codes

---

## Development Notes

- **No email required** - MFA uses TOTP, not email codes
- **Works offline** - Authenticator app generates codes without internet
- **Time-based** - Codes change every 30 seconds
- **Recovery codes** - One-time use, hashed in database

---

## Security Features

- ✅ **TOTP standard** - RFC 6238 compliant
- ✅ **Recovery codes** - 8 codes, hashed with SHA256
- ✅ **Rate limiting** - 5 attempts per 10 minutes
- ✅ **Audit logging** - All MFA events logged
- ✅ **One-time recovery codes** - Used codes are removed

---

## Quick Test Checklist

- [ ] Create test account
- [ ] Install Google Authenticator (or similar)
- [ ] Enable MFA in settings
- [ ] Scan QR code
- [ ] Confirm with 6-digit code
- [ ] Save recovery codes
- [ ] Logout and login with MFA
- [ ] Test recovery code login
- [ ] Test wrong code rejection
- [ ] Test rate limiting

---

## API Endpoints

- `POST /api/auth/mfa/setup` - Generate QR code (requires auth)
- `POST /api/auth/mfa/confirm` - Confirm setup with code (requires auth)
- `POST /api/auth/mfa/verify` - Verify code after login (uses mfaToken)
- `POST /api/auth/mfa/disable` - Disable MFA (requires auth)

---

**No email setup needed!** MFA works entirely through authenticator apps and QR codes.

