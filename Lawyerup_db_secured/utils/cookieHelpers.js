/**
 * Cookie Helper Utilities
 * 
 * Provides secure cookie handling for authentication tokens.
 * 
 * Security Benefits of httpOnly Cookies:
 * 1. XSS Protection: JavaScript cannot access httpOnly cookies, preventing
 *    XSS attacks from stealing tokens via document.cookie
 * 2. CSRF Protection: SameSite=strict prevents cookies from being sent
 *    in cross-site requests, mitigating CSRF attacks
 * 3. Secure Flag: Ensures cookies are only sent over HTTPS in production
 * 4. Automatic Expiry: Browser automatically removes expired cookies
 * 5. No Client-Side Storage: Tokens never stored in localStorage/sessionStorage
 *    which are vulnerable to XSS attacks
 */

const COOKIE_NAME = 'accessToken';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Set access token as httpOnly cookie
 * @param {Object} res - Express response object
 * @param {String} token - JWT access token
 * @param {Number} maxAge - Cookie max age in milliseconds (default: 7 days)
 */
const setAccessTokenCookie = (res, token, maxAge = COOKIE_MAX_AGE) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Set cookie with security flags
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: isProduction, // Only send over HTTPS in production
    sameSite: 'strict', // CSRF protection - only send in same-site requests
    maxAge: maxAge, // Cookie expiry (7 days)
    path: '/' // Cookie available for all paths
  });
};

/**
 * Clear access token cookie
 * @param {Object} res - Express response object
 */
const clearAccessTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

/**
 * Get access token from cookie or Authorization header
 * Priority: Cookie first, then Authorization header (for backward compatibility)
 * @param {Object} req - Express request object
 * @returns {String|null} Token string or null if not found
 */
const getAccessToken = (req) => {
  // Try cookie first (preferred method)
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  
  // Fallback to Authorization header (for backward compatibility)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  return null;
};

module.exports = {
  COOKIE_NAME,
  COOKIE_MAX_AGE,
  setAccessTokenCookie,
  clearAccessTokenCookie,
  getAccessToken
};

