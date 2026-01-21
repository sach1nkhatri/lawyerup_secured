const csrf = require('csrf');
const { logAccessDenied } = require('../utils/auditLogger');

/**
 * CSRF Protection Middleware
 * 
 * OWASP Top 10 Reference: A01:2021 – Broken Access Control
 * 
 * CSRF (Cross-Site Request Forgery) attacks exploit the trust that a site has in a user's browser.
 * This middleware protects state-changing operations (POST, PUT, DELETE, PATCH) from CSRF attacks.
 * 
 * Security: Uses Double Submit Cookie pattern for CSRF protection
 * 
 * Note: For REST APIs with token-based authentication (JWT), CSRF is less critical.
 * However, it's still recommended for cookie-based authentication.
 */

const tokens = new csrf();

// In-memory store for CSRF secrets (keyed by user ID or IP)
// In production, consider using Redis or database for distributed systems
const csrfSecrets = new Map();

/**
 * Generate CSRF token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {String} CSRF token
 */
const generateCsrfToken = (req, res) => {
  // Use user ID if authenticated, otherwise use IP address
  const key = req.user?._id?.toString() || req.ip || 'anonymous';
  
  // Get or create secret for this key
  if (!csrfSecrets.has(key)) {
    csrfSecrets.set(key, tokens.secretSync());
  }
  
  const secret = csrfSecrets.get(key);
  
  // Generate token from secret
  return tokens.create(secret);
};

/**
 * Verify CSRF token
 * @param {String} token - CSRF token from request
 * @param {String} secret - Secret from session
 * @returns {Boolean} true if token is valid
 */
const verifyCsrfToken = (token, secret) => {
  if (!token || !secret) {
    return false;
  }
  return tokens.verify(secret, token);
};

/**
 * CSRF Protection Middleware
 * 
 * Protects state-changing routes (POST, PUT, DELETE, PATCH) from CSRF attacks.
 * GET requests are excluded as they should be idempotent.
 * 
 * OWASP Top 10 Reference: A01:2021 – Broken Access Control
 */
const csrfProtection = async (req, res, next) => {
  // Only protect state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (!stateChangingMethods.includes(req.method)) {
    return next(); // Skip CSRF check for GET, HEAD, OPTIONS
  }

  // Skip CSRF for API endpoints that use token-based auth (not cookie-based)
  // Adjust this based on your authentication strategy
  const tokenBasedAuthPaths = [
    '/api/auth/login',
    '/api/auth/mfa/verify',
    '/api/auth/logout'
  ];
  
  if (tokenBasedAuthPaths.some(path => req.path.startsWith(path))) {
    return next(); // Skip CSRF for token-based auth endpoints
  }

  try {
    // Get CSRF token from header (X-CSRF-Token) or body (_csrf)
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    
    // Get secret from in-memory store (keyed by user ID or IP)
    const key = req.user?._id?.toString() || req.ip || 'anonymous';
    const secret = csrfSecrets.get(key);
    
    if (!csrfToken) {
      // Log CSRF validation failure
      const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
        || req.connection.remoteAddress 
        || req.ip 
        || 'unknown';
      const userAgent = req.headers['user-agent'] || null;
      
      await logAccessDenied(
        req.user?._id?.toString() || null,
        req.user?.role || null,
        clientIp,
        userAgent,
        req.path,
        'csrf_token_missing'
      );
      
      return res.status(403).json({ 
        message: 'CSRF token missing',
        error: 'CSRF_TOKEN_MISSING'
      });
    }
    
    if (!verifyCsrfToken(csrfToken, secret)) {
      // Log CSRF validation failure
      const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
        || req.connection.remoteAddress 
        || req.ip 
        || 'unknown';
      const userAgent = req.headers['user-agent'] || null;
      
      await logAccessDenied(
        req.user?._id?.toString() || null,
        req.user?.role || null,
        clientIp,
        userAgent,
        req.path,
        'csrf_token_invalid'
      );
      
      return res.status(403).json({ 
        message: 'Invalid CSRF token',
        error: 'CSRF_TOKEN_INVALID'
      });
    }
    
    next();
  } catch (error) {
    console.error('[CSRF Protection Error]', error);
    
    // Log CSRF validation error
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
      || req.connection.remoteAddress 
      || req.ip 
      || 'unknown';
    const userAgent = req.headers['user-agent'] || null;
    
    await logAccessDenied(
      req.user?._id?.toString() || null,
      req.user?.role || null,
      clientIp,
      userAgent,
      req.path,
      'csrf_validation_error'
    );
    
    res.status(500).json({ 
      message: 'CSRF validation error',
      error: 'CSRF_VALIDATION_ERROR'
    });
  }
};

/**
 * Middleware to add CSRF token to response
 * Call this before rendering pages that need CSRF protection
 */
const addCsrfToken = (req, res, next) => {
  // Generate CSRF token and add to response
  const token = generateCsrfToken(req, res);
  res.locals.csrfToken = token;
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // Must be readable by JavaScript for Double Submit Cookie pattern
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  next();
};

module.exports = {
  csrfProtection,
  generateCsrfToken,
  verifyCsrfToken,
  addCsrfToken
};

