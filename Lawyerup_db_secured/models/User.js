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
  // Password history: stores hashed versions of previous passwords
  // Used to prevent password reuse (last N passwords)
  passwordHistory: [{
    type: String, // Hashed passwords
    select: false
  }],
  // Timestamp when password was last changed
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  // Timestamp when password expires (null = no expiry)
  passwordExpiresAt: {
    type: Date,
    default: null
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

// ==================== Password Policy Instance Methods ====================

/**
 * Check if password has expired
 * @returns {Boolean} true if password is expired, false otherwise
 */
userSchema.methods.isPasswordExpired = function() {
  // If no expiry date is set, password never expires
  if (!this.passwordExpiresAt) {
    return false;
  }
  // Check if expiry date has passed
  return this.passwordExpiresAt <= Date.now();
};

/**
 * Check if password is reused (matches any password in history)
 * @param {String} plainPassword - Plain text password to check
 * @param {Function} compareFn - Async function to compare password with hash (bcrypt.compare)
 * @returns {Promise<Boolean>} true if password is reused
 */
userSchema.methods.isPasswordReused = async function(plainPassword, compareFn) {
  if (!this.passwordHistory || this.passwordHistory.length === 0) {
    return false;
  }

  // Check against all passwords in history
  for (const hashedPassword of this.passwordHistory) {
    const isMatch = await compareFn(plainPassword, hashedPassword);
    if (isMatch) {
      return true;
    }
  }

  return false;
};

/**
 * Update password and maintain history
 * @param {String} newHashedPassword - New hashed password
 * @param {Number} historyCount - Number of previous passwords to keep (default: 5)
 * @param {Number} expiryDays - Days until password expires (null = no expiry)
 * @returns {Promise<void>}
 */
userSchema.methods.updatePassword = async function(newHashedPassword, historyCount = 5, expiryDays = 90) {
  // Add current password to history before changing
  if (this.password) {
    // Add to beginning of array (most recent first)
    this.passwordHistory.unshift(this.password);
    
    // Keep only the last N passwords
    if (this.passwordHistory.length > historyCount) {
      this.passwordHistory = this.passwordHistory.slice(0, historyCount);
    }
  }

  // Update password
  this.password = newHashedPassword;
  
  // Update password changed timestamp
  this.passwordChangedAt = Date.now();
  
  // Set password expiry date
  if (expiryDays && expiryDays > 0) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    this.passwordExpiresAt = expiryDate;
  } else {
    this.passwordExpiresAt = null;
  }

  await this.save();
};

module.exports = mongoose.model('User', userSchema);
