const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  contactNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'lawyer', 'admin'],
    default: 'user'
  },
  plan: {
    type: String,
    default: 'Free Trial'
  },

  status: {
    type: String,
    enum: ['verified', 'hold', 'disable'],
    default: 'verified',
  },
  

//complete profile section
  state: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },

  // Multi-Factor Authentication (MFA) fields
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  // TOTP secret (base32 encoded) - stored in plain text for now
  // TODO: Consider encrypting this field in production for enhanced security
  mfaSecret: {
    type: String,
    default: null,
    select: false // Never return in queries unless explicitly requested
  },
  // Temporary secret used only during MFA setup flow
  mfaTempSecret: {
    type: String,
    default: null,
    select: false
  },
  // Recovery codes (hashed) - one-time use codes for account recovery
  mfaRecoveryCodes: [{
    type: String, // Hashed recovery codes
    select: false
  }],

  // Brute-force protection fields
  // Track failed login attempts to prevent brute-force attacks
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  // Timestamp when account lock expires (null if not locked)
  // Account is locked after exceeding max failed attempts
  lockUntil: {
    type: Date,
    default: null
  }

}, { timestamps: true });

// ==================== Brute-Force Protection Instance Methods ====================

/**
 * Check if account is currently locked due to failed login attempts
 * @returns {Boolean} true if account is locked, false otherwise
 */
userSchema.methods.isLocked = function() {
  // Check if lockUntil exists and is in the future
  // If lock expired, unlock the account automatically
  if (this.lockUntil && this.lockUntil > Date.now()) {
    return true;
  }
  // If lock expired, reset the lock
  if (this.lockUntil && this.lockUntil <= Date.now()) {
    this.lockUntil = null;
    this.failedLoginAttempts = 0;
  }
  return false;
};

/**
 * Register a failed login attempt and lock account if threshold exceeded
 * @param {Number} maxAttempts - Maximum allowed failed attempts before lockout (default: 5)
 * @param {Number} lockMinutes - Minutes to lock account (default: 30)
 * @returns {Promise<void>}
 */
userSchema.methods.registerFailedLogin = async function(maxAttempts = 5, lockMinutes = 30) {
  // If account was locked but lock expired, reset attempts
  if (this.lockUntil && this.lockUntil <= Date.now()) {
    this.lockUntil = null;
    this.failedLoginAttempts = 0;
  }

  // Increment failed attempts counter
  this.failedLoginAttempts += 1;

  // Lock account if max attempts exceeded
  // Lock duration increases with each subsequent lockout (exponential backoff)
  if (this.failedLoginAttempts >= maxAttempts && !this.lockUntil) {
    // Calculate lock duration: base time * (2 ^ (number of previous locks))
    // This prevents repeated lockouts from being too predictable
    const lockDuration = lockMinutes * 60 * 1000; // Convert to milliseconds
    this.lockUntil = Date.now() + lockDuration;
  }

  await this.save();
};

/**
 * Reset failed login attempts counter after successful login
 * @returns {Promise<void>}
 */
userSchema.methods.resetLoginAttempts = async function() {
  // Reset both failed attempts and lock status on successful login
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
