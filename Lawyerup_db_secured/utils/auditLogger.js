const AuditLog = require('../models/AuditLog');

/**
 * Audit Logger Utility
 * 
 * Centralized logging for security-sensitive actions.
 * 
 * Forensic Value:
 * - Immutable record of all security events
 * - Enables post-incident analysis and reconstruction
 * - Supports compliance requirements (GDPR, SOC 2, PCI-DSS)
 * - Provides evidence for legal proceedings
 * - Helps identify attack patterns and trends
 */

/**
 * Log an audit event to the database
 * @param {String} action - Action type (e.g., 'LOGIN_SUCCESS', 'PASSWORD_CHANGE')
 * @param {Object} options - Event details
 * @param {String} options.userId - User ID (optional, null for anonymous actions)
 * @param {String} options.role - User role (optional)
 * @param {String} options.ipAddress - IP address of the request
 * @param {String} options.userAgent - User agent string (optional)
 * @param {Object} options.metadata - Additional event metadata (optional)
 * @returns {Promise<void>}
 */
const logAuditEvent = async (action, options = {}) => {
  const {
    userId = null,
    role = null,
    ipAddress,
    userAgent = null,
    metadata = {}
  } = options;

  // Validate required fields
  if (!action) {
    console.error('[Audit Logger] Action is required');
    return;
  }

  if (!ipAddress) {
    console.error('[Audit Logger] IP address is required');
    return;
  }

  try {
    // Create audit log entry
    // Forensic: This creates an immutable record that cannot be modified
    await AuditLog.create({
      action,
      userId,
      role,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      metadata
    });
  } catch (error) {
    // Log errors but don't throw (audit logging should not break application flow)
    console.error('[Audit Logger Error]', error);
  }
};

/**
 * Log login success event
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @param {String} ipAddress - IP address
 * @param {String} userAgent - User agent
 * @param {Object} metadata - Additional metadata (e.g., { mfaRequired: true })
 */
const logLoginSuccess = async (userId, role, ipAddress, userAgent = null, metadata = {}) => {
  await logAuditEvent('LOGIN_SUCCESS', {
    userId,
    role,
    ipAddress,
    userAgent,
    metadata: {
      ...metadata,
      eventType: 'authentication'
    }
  });
};

/**
 * Log login failure event
 * @param {String} email - User email (or 'unknown')
 * @param {String} ipAddress - IP address
 * @param {String} userAgent - User agent
 * @param {String} reason - Failure reason (e.g., 'invalid_password', 'user_not_found')
 */
const logLoginFailed = async (email, ipAddress, userAgent = null, reason = 'unknown') => {
  await logAuditEvent('LOGIN_FAILED', {
    userId: null, // No user ID for failed logins
    role: null,
    ipAddress,
    userAgent,
    metadata: {
      email,
      reason,
      eventType: 'authentication',
      severity: 'medium'
    }
  });
};

/**
 * Log account lockout event
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @param {String} ipAddress - IP address
 * @param {String} userAgent - User agent
 * @param {Number} failedAttempts - Number of failed attempts
 * @param {Date} lockUntil - Lock expiry timestamp
 */
const logAccountLocked = async (userId, role, ipAddress, userAgent = null, failedAttempts, lockUntil) => {
  await logAuditEvent('ACCOUNT_LOCKED', {
    userId,
    role,
    ipAddress,
    userAgent,
    metadata: {
      failedAttempts,
      lockUntil: lockUntil.toISOString(),
      eventType: 'security',
      severity: 'high'
    }
  });
};

/**
 * Log MFA setup event
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @param {String} ipAddress - IP address
 * @param {String} userAgent - User agent
 */
const logMfaSetup = async (userId, role, ipAddress, userAgent = null) => {
  await logAuditEvent('MFA_SETUP', {
    userId,
    role,
    ipAddress,
    userAgent,
    metadata: {
      eventType: 'authentication',
      severity: 'low'
    }
  });
};

/**
 * Log MFA verification event (success or failure)
 * @param {String} action - 'MFA_VERIFY_SUCCESS' or 'MFA_VERIFY_FAILED'
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @param {String} ipAddress - IP address
 * @param {String} userAgent - User agent
 * @param {String} method - Verification method ('totp' or 'recovery_code')
 * @param {String} reason - Failure reason (optional, for failed attempts)
 */
const logMfaVerify = async (action, userId, role, ipAddress, userAgent = null, method = 'totp', reason = null) => {
  await logAuditEvent(action, {
    userId,
    role,
    ipAddress,
    userAgent,
    metadata: {
      method,
      reason,
      eventType: 'authentication',
      severity: action === 'MFA_VERIFY_FAILED' ? 'medium' : 'low'
    }
  });
};

/**
 * Log password change event
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @param {String} ipAddress - IP address
 * @param {String} userAgent - User agent
 */
const logPasswordChange = async (userId, role, ipAddress, userAgent = null) => {
  await logAuditEvent('PASSWORD_CHANGE', {
    userId,
    role,
    ipAddress,
    userAgent,
    metadata: {
      eventType: 'account_management',
      severity: 'medium'
    }
  });
};

/**
 * Log access denied event
 * @param {String} userId - User ID (optional, null for unauthenticated)
 * @param {String} role - User role (optional)
 * @param {String} ipAddress - IP address
 * @param {String} userAgent - User agent
 * @param {String} resource - Resource that was accessed (optional)
 * @param {String} reason - Reason for denial (optional)
 */
const logAccessDenied = async (userId, role, ipAddress, userAgent = null, resource = null, reason = null) => {
  await logAuditEvent('ACCESS_DENIED', {
    userId,
    role,
    ipAddress,
    userAgent,
    metadata: {
      resource,
      reason,
      eventType: 'authorization',
      severity: 'high'
    }
  });
};

module.exports = {
  logAuditEvent,
  logLoginSuccess,
  logLoginFailed,
  logAccountLocked,
  logMfaSetup,
  logMfaVerify,
  logPasswordChange,
  logAccessDenied
};

