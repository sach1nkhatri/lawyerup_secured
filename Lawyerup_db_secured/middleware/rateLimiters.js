const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login endpoint
 * Prevents brute-force attacks by limiting login attempts
 * 
 * Security reasoning:
 * - 5 attempts per 15 minutes per IP address
 * - Prevents automated brute-force attacks
 * - Works in conjunction with account lockout for defense in depth
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use IP address as the key for rate limiting
  keyGenerator: (req) => {
    // Prefer IP from proxy headers if available (X-Forwarded-For)
    return req.ip || req.connection.remoteAddress;
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
 */
const mfaLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 MFA verification requests per windowMs
  message: {
    error: 'Too many MFA verification attempts from this IP, please try again after 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP address, but could also use mfaToken if available for per-user limiting
    return req.ip || req.connection.remoteAddress;
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

