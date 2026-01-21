/**
 * Security Event Logger
 * 
 * Logs security-related events for audit and monitoring purposes.
 * Integrates with audit logger for database persistence.
 */

const auditLogger = require('./auditLogger');

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

  // Log to console for immediate visibility
  console.log(`[SECURITY EVENT] ${eventType}`, JSON.stringify(logEntry, null, 2));

  // Also log to audit database for forensic analysis
  // Note: Audit logging is async but we don't await to avoid blocking request flow
};

/**
 * Log failed login attempt
 * @param {String} email - User email (or 'unknown' if user not found)
 * @param {String} ip - IP address of the request
 * @param {String} userAgent - User agent string (optional)
 * @param {String} reason - Reason for failure (e.g., 'invalid_password', 'user_not_found')
 */
const logLoginFailed = async (email, ip, userAgent = null, reason = 'unknown') => {
  logSecurityEvent('LOGIN_FAILED', {
    email,
    ip,
    reason,
    severity: 'medium'
  });
  
  // Log to audit database
  await auditLogger.logLoginFailed(email, ip, userAgent, reason);
};

/**
 * Log successful login
 * @param {String} userId - User ID
 * @param {String} email - User email
 * @param {String} role - User role
 * @param {String} ip - IP address of the request
 * @param {String} userAgent - User agent string (optional)
 * @param {Boolean} mfaRequired - Whether MFA was required
 */
const logLoginSuccess = async (userId, role, email, ip, userAgent = null, mfaRequired = false) => {
  logSecurityEvent('LOGIN_SUCCESS', {
    userId,
    email,
    ip,
    mfaRequired,
    severity: 'low'
  });
  
  // Log to audit database
  await auditLogger.logLoginSuccess(userId, role, ip, userAgent, { mfaRequired });
};

/**
 * Log account lockout event
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @param {String} email - User email
 * @param {String} ip - IP address of the request
 * @param {String} userAgent - User agent string (optional)
 * @param {Number} failedAttempts - Number of failed attempts
 * @param {Date} lockUntil - When the lock expires
 */
const logAccountLocked = async (userId, role, email, ip, userAgent = null, failedAttempts, lockUntil) => {
  logSecurityEvent('ACCOUNT_LOCKED', {
    userId,
    email,
    ip,
    failedAttempts,
    lockUntil: lockUntil.toISOString(),
    severity: 'high'
  });
  
  // Log to audit database
  await auditLogger.logAccountLocked(userId, role, ip, userAgent, failedAttempts, lockUntil);
};

/**
 * Log failed MFA verification attempt
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @param {String} email - User email
 * @param {String} ip - IP address of the request
 * @param {String} userAgent - User agent string (optional)
 * @param {String} reason - Reason for failure (e.g., 'invalid_totp', 'invalid_recovery_code')
 */
const logMfaVerifyFailed = async (userId, role, email, ip, userAgent = null, reason = 'unknown') => {
  logSecurityEvent('MFA_VERIFY_FAILED', {
    userId,
    email,
    ip,
    reason,
    severity: 'medium'
  });
  
  // Log to audit database
  await auditLogger.logMfaVerify('MFA_VERIFY_FAILED', userId, role, ip, userAgent, 'totp', reason);
};

/**
 * Log successful MFA verification
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @param {String} email - User email
 * @param {String} ip - IP address of the request
 * @param {String} userAgent - User agent string (optional)
 * @param {String} method - Verification method ('totp' or 'recovery_code')
 */
const logMfaVerifySuccess = async (userId, role, email, ip, userAgent = null, method = 'totp') => {
  logSecurityEvent('MFA_VERIFY_SUCCESS', {
    userId,
    email,
    ip,
    method,
    severity: 'low'
  });
  
  // Log to audit database
  await auditLogger.logMfaVerify('MFA_VERIFY_SUCCESS', userId, role, ip, userAgent, method);
};

module.exports = {
  logSecurityEvent,
  logLoginFailed,
  logLoginSuccess,
  logAccountLocked,
  logMfaVerifyFailed,
  logMfaVerifySuccess
};

