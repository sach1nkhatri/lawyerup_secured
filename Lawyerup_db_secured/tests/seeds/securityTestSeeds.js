const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const AuditLog = require('../../models/AuditLog');
const speakeasy = require('speakeasy');

/**
 * Security Test Data Seeds
 * 
 * Provides test data for security testing scenarios:
 * - Users with various roles and security states
 * - Users with MFA enabled/disabled
 * - Users with locked accounts
 * - Users with expired passwords
 * - Audit log entries for testing
 * 
 * Usage: Import and call seed functions in test files
 */

const DEFAULT_PASSWORD = 'TestPassword123!'; // Meets password policy requirements
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

/**
 * Create test users for security testing
 * @returns {Promise<Object>} Object containing created users
 */
const seedSecurityTestUsers = async () => {
  // Regular user (no MFA, not locked)
  const regularUser = await User.create({
    fullName: 'Regular Test User',
    email: 'regular@security.test',
    password: DEFAULT_PASSWORD_HASH,
    contactNumber: '1111111111',
    role: 'user',
    mfaEnabled: false,
    failedLoginAttempts: 0,
    lockUntil: null,
    passwordExpiresAt: null
  });

  // User with MFA enabled
  const mfaSecret = speakeasy.generateSecret().base32;
  const mfaUser = await User.create({
    fullName: 'MFA Test User',
    email: 'mfa@security.test',
    password: DEFAULT_PASSWORD_HASH,
    contactNumber: '2222222222',
    role: 'user',
    mfaEnabled: true,
    mfaSecret: mfaSecret,
    failedLoginAttempts: 0,
    lockUntil: null,
    passwordExpiresAt: null
  });

  // Locked user (for brute force testing)
  const lockedUser = await User.create({
    fullName: 'Locked Test User',
    email: 'locked@security.test',
    password: DEFAULT_PASSWORD_HASH,
    contactNumber: '3333333333',
    role: 'user',
    mfaEnabled: false,
    failedLoginAttempts: 5,
    lockUntil: new Date(Date.now() + 30 * 60 * 1000), // Locked for 30 minutes
    passwordExpiresAt: null
  });

  // User with expired password
  const expiredPasswordUser = await User.create({
    fullName: 'Expired Password User',
    email: 'expired@security.test',
    password: DEFAULT_PASSWORD_HASH,
    contactNumber: '4444444444',
    role: 'user',
    mfaEnabled: false,
    failedLoginAttempts: 0,
    lockUntil: null,
    passwordExpiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Expired 1 day ago
  });

  // Admin user (for RBAC testing)
  const adminUser = await User.create({
    fullName: 'Admin Test User',
    email: 'admin@security.test',
    password: DEFAULT_PASSWORD_HASH,
    contactNumber: '9999999999',
    role: 'admin',
    mfaEnabled: false,
    failedLoginAttempts: 0,
    lockUntil: null,
    passwordExpiresAt: null
  });

  // User with high failed attempts (close to lockout)
  const nearLockoutUser = await User.create({
    fullName: 'Near Lockout User',
    email: 'nearlockout@security.test',
    password: DEFAULT_PASSWORD_HASH,
    contactNumber: '5555555555',
    role: 'user',
    mfaEnabled: false,
    failedLoginAttempts: 4, // One attempt away from lockout
    lockUntil: null,
    passwordExpiresAt: null
  });

  return {
    regularUser,
    mfaUser,
    lockedUser,
    expiredPasswordUser,
    adminUser,
    nearLockoutUser,
    mfaSecret // Return MFA secret for testing
  };
};

/**
 * Create audit log entries for testing
 * @param {Object} users - Users object from seedSecurityTestUsers
 * @returns {Promise<Array>} Array of created audit logs
 */
const seedAuditLogs = async (users) => {
  const logs = [];

  // Login success logs
  logs.push(await AuditLog.create({
    action: 'LOGIN_SUCCESS',
    userId: users.regularUser._id,
    role: 'user',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    metadata: { mfaRequired: false }
  }));

  // Login failed logs
  for (let i = 0; i < 3; i++) {
    logs.push(await AuditLog.create({
      action: 'LOGIN_FAILED',
      userId: null,
      role: null,
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      metadata: { 
        email: 'attacker@test.com',
        reason: 'invalid_password'
      }
    }));
  }

  // Account locked log
  logs.push(await AuditLog.create({
    action: 'ACCOUNT_LOCKED',
    userId: users.lockedUser._id,
    role: 'user',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    metadata: {
      failedAttempts: 5,
      lockUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    }
  }));

  // MFA setup log
  logs.push(await AuditLog.create({
    action: 'MFA_SETUP',
    userId: users.mfaUser._id,
    role: 'user',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    metadata: {}
  }));

  // MFA verify failed log
  logs.push(await AuditLog.create({
    action: 'MFA_VERIFY_FAILED',
    userId: users.mfaUser._id,
    role: 'user',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    metadata: {
      method: 'totp',
      reason: 'invalid_totp'
    }
  }));

  // Access denied log
  logs.push(await AuditLog.create({
    action: 'ACCESS_DENIED',
    userId: users.regularUser._id,
    role: 'user',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    metadata: {
      resource: '/api/admin/audit-logs',
      reason: 'insufficient_permissions'
    }
  }));

  // Password change log
  logs.push(await AuditLog.create({
    action: 'PASSWORD_CHANGE',
    userId: users.regularUser._id,
    role: 'user',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    metadata: {}
  }));

  return logs;
};

/**
 * Clean up test data
 * @returns {Promise<void>}
 */
const cleanupSecurityTestData = async () => {
  await User.deleteMany({ 
    email: { 
      $in: [
        'regular@security.test',
        'mfa@security.test',
        'locked@security.test',
        'expired@security.test',
        'admin@security.test',
        'nearlockout@security.test'
      ]
    }
  });
  
  await AuditLog.deleteMany({
    ipAddress: { $in: ['192.168.1.100', '192.168.1.200'] }
  });
};

module.exports = {
  seedSecurityTestUsers,
  seedAuditLogs,
  cleanupSecurityTestData,
  DEFAULT_PASSWORD
};

