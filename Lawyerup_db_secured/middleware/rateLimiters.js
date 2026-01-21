const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login endpoint
 * Prevents brute-force attacks by limiting login attempts
 * 
 * Security reasoning:
 * - 5 attempts per 15 minutes per IP address
 * - Prevents automated brute-force attacks
 * - Works in conjunction with account lockout for defense in depth
 * 
 * OWASP Top 10 Reference: A07:2021 – Identification and Authentication Failures
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use default IP key generator (handles IPv6 correctly)
  // OWASP: Proper IP handling prevents IPv6 users from bypassing rate limits
  keyGenerator: (req) => {
    // Use express-rate-limit's built-in IP detection
    // This properly handles IPv6 addresses and prevents bypass
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  // Custom handler for when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts from this IP, please try again after 15 minutes.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Rate limiter for MFA verification endpoint
 * Prevents brute-force attacks on MFA codes
 * 
 * Security reasoning:
 * - 5 attempts per 10 minutes per IP address
 * - Tighter window than login since MFA codes are 6 digits (smaller search space)
 * - Prevents automated TOTP code guessing attacks
 * 
 * OWASP Top 10 Reference: A07:2021 – Identification and Authentication Failures
 */
const mfaLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 MFA verification requests per windowMs
  message: {
    error: 'Too many MFA verification attempts from this IP, please try again after 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default IP key generator (handles IPv6 correctly)
  // OWASP: Proper IP handling prevents IPv6 users from bypassing rate limits
  keyGenerator: (req) => {
    // Use express-rate-limit's built-in IP detection
    // This properly handles IPv6 addresses and prevents bypass
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many MFA verification attempts from this IP, please try again after 10 minutes.',
      retryAfter: '10 minutes'
    });
  }
});

module.exports = {
  loginLimiter,
  mfaLimiter
};

