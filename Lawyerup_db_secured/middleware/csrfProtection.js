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
 * Note: For REST APIs with cookie-based authentication (httpOnly cookies), CSRF protection is critical.
 */

const tokens = new csrf();

/**
 * Generate CSRF token and secret
 * Uses cookie-based secret storage for better scalability
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {String} CSRF token
 */
const generateCsrfToken = (req, res) => {
  // Get or create secret from cookie
  let secret = req.cookies._csrf_secret;
  
  if (!secret) {
    // Generate new secret and store in httpOnly cookie
    secret = tokens.secretSync();
    res.cookie('_csrf_secret', secret, {
      httpOnly: true, // Secret must be httpOnly to prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }
  
  // Generate token from secret
  return tokens.create(secret);
};

/**
 * Verify CSRF token
 * @param {String} token - CSRF token from request header
 * @param {String} secret - Secret from cookie
 * @returns {Boolean} true if token is valid
 */
const verifyCsrfToken = (token, secret) => {
  if (!token || !secret) {
    return false;
  }
  try {
    return tokens.verify(secret, token);
  } catch (error) {
    return false;
  }
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

  // Skip CSRF for public endpoints (login, signup, MFA verify)
  // These endpoints don't use cookie-based auth initially
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/mfa/verify'
  ];
  
  if (publicPaths.some(path => req.path === path)) {
    return next(); // Skip CSRF for public endpoints
  }
  
  // Skip CSRF for logout (handled separately, clears cookies)
  if (req.path === '/api/auth/logout') {
    return next();
  }

  try {
    // Get CSRF token from header (X-CSRF-Token)
    // Frontend should send token in X-CSRF-Token header
    const csrfToken = req.headers['x-csrf-token'];
    
    // Get secret from cookie (set by generateCsrfToken)
    const secret = req.cookies._csrf_secret;
    
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
 * Generates token and sets it in both response body and cookie
 * Frontend can read from cookie or response body
 */
const addCsrfToken = (req, res, next) => {
  // Generate CSRF token (also sets secret in httpOnly cookie)
  const token = generateCsrfToken(req, res);
  
  // Set token in response for API endpoints
  res.locals.csrfToken = token;
  
  // Also set in non-httpOnly cookie for frontend to read (Double Submit Cookie pattern)
  // Frontend reads this and sends it back in X-CSRF-Token header
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  next();
};

module.exports = {
  csrfProtection,
  generateCsrfToken,
  verifyCsrfToken,
  addCsrfToken
};

