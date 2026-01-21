/**
 * Security Event Logger
 * 
 * Logs security-related events for audit and monitoring purposes.
 * Currently logs to console, but can be extended to:
 * - Write to database (audit log collection)
 * - Send to external logging service (e.g., Winston, Bunyan, CloudWatch)
 * - Alert administrators on critical events
 */

/**
 * Log a security event
 * @param {String} eventType - Type of security event (e.g., 'LOGIN_FAILED', 'ACCOUNT_LOCKED')
 * @param {Object} details - Event details (userId, email, ip, etc.)
 */
const logSecurityEvent = (eventType, details = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    ...details
  };

  // Log to console (can be replaced with proper audit logging)
  console.log(`[SECURITY EVENT] ${eventType}`, JSON.stringify(logEntry, null, 2));

  // TODO: If audit logger exists, integrate here
  // Example:
  // AuditLog.create({
  //   timestamp,
  //   eventType,
  //   userId: details.userId,
  //   email: details.email,
  //   ipAddress: details.ip,
  //   userAgent: details.userAgent,
  //   metadata: details.metadata
  // });
};

/**
 * Log failed login attempt
 * @param {String} email - User email (or 'unknown' if user not found)
 * @param {String} ip - IP address of the request
 * @param {String} reason - Reason for failure (e.g., 'invalid_password', 'user_not_found')
 */
const logLoginFailed = (email, ip, reason = 'unknown') => {
  logSecurityEvent('LOGIN_FAILED', {
    email,
    ip,
    reason,
    severity: 'medium'
  });
};

/**
 * Log successful login
 * @param {String} userId - User ID
 * @param {String} email - User email
 * @param {String} ip - IP address of the request
 * @param {Boolean} mfaRequired - Whether MFA was required
 */
const logLoginSuccess = (userId, email, ip, mfaRequired = false) => {
  logSecurityEvent('LOGIN_SUCCESS', {
    userId,
    email,
    ip,
    mfaRequired,
    severity: 'low'
  });
};

/**
 * Log account lockout event
 * @param {String} userId - User ID
 * @param {String} email - User email
 * @param {String} ip - IP address of the request
 * @param {Number} failedAttempts - Number of failed attempts
 * @param {Date} lockUntil - When the lock expires
 */
const logAccountLocked = (userId, email, ip, failedAttempts, lockUntil) => {
  logSecurityEvent('ACCOUNT_LOCKED', {
    userId,
    email,
    ip,
    failedAttempts,
    lockUntil: lockUntil.toISOString(),
    severity: 'high'
  });
};

/**
 * Log failed MFA verification attempt
 * @param {String} userId - User ID
 * @param {String} email - User email
 * @param {String} ip - IP address of the request
 * @param {String} reason - Reason for failure (e.g., 'invalid_totp', 'invalid_recovery_code')
 */
const logMfaVerifyFailed = (userId, email, ip, reason = 'unknown') => {
  logSecurityEvent('MFA_VERIFY_FAILED', {
    userId,
    email,
    ip,
    reason,
    severity: 'medium'
  });
};

/**
 * Log successful MFA verification
 * @param {String} userId - User ID
 * @param {String} email - User email
 * @param {String} ip - IP address of the request
 * @param {String} method - Verification method ('totp' or 'recovery_code')
 */
const logMfaVerifySuccess = (userId, email, ip, method = 'totp') => {
  logSecurityEvent('MFA_VERIFY_SUCCESS', {
    userId,
    email,
    ip,
    method,
    severity: 'low'
  });
};

module.exports = {
  logSecurityEvent,
  logLoginFailed,
  logLoginSuccess,
  logAccountLocked,
  logMfaVerifyFailed,
  logMfaVerifySuccess
};

