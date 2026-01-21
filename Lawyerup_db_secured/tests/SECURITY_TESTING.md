# Security Testing Guide

This document describes the security test suite and how to use it for security validation and PoC (Proof of Concept) testing.

## Overview

The security test suite validates protections against common vulnerabilities as defined in OWASP Top 10:

- **A01:2021 – Broken Access Control** (IDOR, unauthorized access)
- **A07:2021 – Identification and Authentication Failures** (brute force, MFA guessing, password expiry)

## Test Structure

### Test Files

- `tests/model_and_route_test/security.test.js` - Main security test suite
- `tests/seeds/securityTestSeeds.js` - Test data seeds for security scenarios

### Test Categories

1. **Brute Force Protection**
   - Account lockout after 5 failed attempts
   - Locked account prevents login even with correct password
   - Failed attempts reset on successful login

2. **MFA Code Guessing Protection**
   - Rate limiting on MFA verification endpoint
   - Failed MFA attempts logged

3. **IDOR (Insecure Direct Object Reference) Prevention**
   - Users cannot access other users' resources
   - Admin-only routes protected
   - Authorization checks enforced

4. **Access Denied Logging**
   - All unauthorized access attempts logged
   - Audit trail for security incidents

5. **Rate Limiting Protection**
   - Login endpoint rate limited
   - MFA endpoint rate limited

6. **Password Expiry Protection**
   - Expired passwords prevent login
   - Password change required

## Running Security Tests

```bash
# Run all security tests
npm test -- security.test.js

# Run specific test suite
npm test -- security.test.js -t "Brute Force"

# Run with verbose output
npm test -- security.test.js --verbose
```

## Test Data Seeds

The `securityTestSeeds.js` file provides pre-configured test users:

- **regularUser**: Normal user, no MFA, not locked
- **mfaUser**: User with MFA enabled (includes MFA secret)
- **lockedUser**: User with locked account (5 failed attempts)
- **expiredPasswordUser**: User with expired password
- **adminUser**: Admin user for RBAC testing
- **nearLockoutUser**: User with 4 failed attempts (1 away from lockout)

### Using Test Seeds

```javascript
const { seedSecurityTestUsers, DEFAULT_PASSWORD } = require('../seeds/securityTestSeeds');

beforeAll(async () => {
  testUsers = await seedSecurityTestUsers();
  // Use testUsers.regularUser, testUsers.mfaUser, etc.
});
```

## Vulnerability Descriptions

Each test includes comments describing:

1. **Vulnerability**: OWASP Top 10 category and attack vector
2. **Attack**: How the attack would be performed
3. **Expected Behavior**: What the system should do to prevent/respond
4. **Fix Validation**: How the test verifies the protection works

## Example Test Structure

```javascript
it('should prevent [attack]', async () => {
  /**
   * Vulnerability: A01:2021 – Broken Access Control
   * 
   * Attack: [Description of attack]
   * Expected Behavior: [What should happen]
   * Fix Validation: [How we verify the fix]
   */
  
  // Test implementation
});
```

## Security Test Scenarios

### Brute Force Attack PoC

**Attack**: Attempt 5+ failed logins to trigger account lockout

**Expected**: Account locks after 5 attempts, returns 423 status

**Validation**: 
- `failedLoginAttempts >= 5`
- `isLocked() === true`
- Login returns 423 with `lockUntil` timestamp

### MFA Guessing PoC

**Attack**: Rapid MFA code attempts to guess 6-digit TOTP

**Expected**: Rate limiter blocks after 5 attempts per 10 minutes

**Validation**:
- After 5 attempts, returns 429 status
- Audit logs contain `MFA_VERIFY_FAILED` entries

### IDOR PoC

**Attack**: User1 tries to access/modify User2's resources by manipulating IDs

**Expected**: Authorization checks prevent unauthorized access

**Validation**:
- Non-admin cannot update other users' status (403)
- `/me` endpoint returns only authenticated user's data
- Admin can legitimately access all resources

### Access Denied Logging PoC

**Attack**: Unauthorized access attempts to protected routes

**Expected**: All attempts logged to audit system

**Validation**:
- Audit logs contain `ACCESS_DENIED` entries
- Logs include user ID, IP, reason, resource path

## Notes

- **No Production Bypasses**: Tests do not include any production bypass mechanisms
- **Clean Test Data**: Tests clean up after themselves to avoid data pollution
- **Isolated Tests**: Each test suite is independent and can run in any order
- **Realistic Scenarios**: Tests simulate real attack patterns

## Integration with CI/CD

Security tests should be run:
- Before every deployment
- As part of pull request validation
- In scheduled security scans
- After security updates

## Reporting

Test results provide:
- Vulnerability category (OWASP reference)
- Attack vector description
- Expected vs actual behavior
- Fix validation status

Use test results to:
- Verify security controls work correctly
- Document security posture
- Support compliance audits
- Identify security gaps

