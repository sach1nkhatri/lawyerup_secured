
// Password length constraints
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

// Password complexity requirements
const PASSWORD_COMPLEXITY = {
  // Require at least one uppercase letter
  requireUppercase: true,
  // Require at least one lowercase letter
  requireLowercase: true,
  // Require at least one number
  requireNumber: true,
  // Require at least one special character
  requireSpecialChar: true,
  // Special characters allowed (common set)
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Password history: prevent reuse of last N passwords
const PASSWORD_HISTORY_COUNT = 5;

// Password expiry: passwords expire after N days (null = no expiry)
const PASSWORD_EXPIRY_DAYS = 90; // 90 days

// Password validation error messages
const PASSWORD_ERRORS = {
  TOO_SHORT: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
  TOO_LONG: `Password must be no more than ${PASSWORD_MAX_LENGTH} characters long`,
  MISSING_UPPERCASE: 'Password must contain at least one uppercase letter',
  MISSING_LOWERCASE: 'Password must contain at least one lowercase letter',
  MISSING_NUMBER: 'Password must contain at least one number',
  MISSING_SPECIAL_CHAR: `Password must contain at least one special character (${PASSWORD_COMPLEXITY.specialChars})`,
  REUSED_PASSWORD: `Password cannot be the same as your last ${PASSWORD_HISTORY_COUNT} passwords`,
  EXPIRED_PASSWORD: 'Your password has expired. Please change it to continue',
  WEAK_PASSWORD: 'Password does not meet complexity requirements'
};

/**
 * Validate password against policy
 * @param {String} password - Password to validate
 * @returns {Object} { valid: Boolean, errors: String[] }
 */
const validatePassword = (password) => {
  const errors = [];

  // Check length
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(PASSWORD_ERRORS.TOO_SHORT);
  }
  if (password && password.length > PASSWORD_MAX_LENGTH) {
    errors.push(PASSWORD_ERRORS.TOO_LONG);
  }

  // Check complexity requirements
  if (password) {
    if (PASSWORD_COMPLEXITY.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push(PASSWORD_ERRORS.MISSING_UPPERCASE);
    }
    if (PASSWORD_COMPLEXITY.requireLowercase && !/[a-z]/.test(password)) {
      errors.push(PASSWORD_ERRORS.MISSING_LOWERCASE);
    }
    if (PASSWORD_COMPLEXITY.requireNumber && !/[0-9]/.test(password)) {
      errors.push(PASSWORD_ERRORS.MISSING_NUMBER);
    }
    if (PASSWORD_COMPLEXITY.requireSpecialChar) {
      const specialCharRegex = new RegExp(`[${PASSWORD_COMPLEXITY.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
      if (!specialCharRegex.test(password)) {
        errors.push(PASSWORD_ERRORS.MISSING_SPECIAL_CHAR);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Check if password is reused (matches any password in history)
 * @param {String} plainPassword - Plain text password to check
 * @param {Array<String>} passwordHistory - Array of hashed passwords
 * @param {Function} compareFn - Async function to compare password with hash (bcrypt.compare)
 * @returns {Promise<Boolean>} true if password is reused
 */
const isPasswordReused = async (plainPassword, passwordHistory, compareFn) => {
  if (!passwordHistory || passwordHistory.length === 0) {
    return false;
  }

  // Check against all passwords in history
  for (const hashedPassword of passwordHistory) {
    const isMatch = await compareFn(plainPassword, hashedPassword);
    if (isMatch) {
      return true;
    }
  }

  return false;
};

module.exports = {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_COMPLEXITY,
  PASSWORD_HISTORY_COUNT,
  PASSWORD_EXPIRY_DAYS,
  PASSWORD_ERRORS,
  validatePassword,
  isPasswordReused
};

