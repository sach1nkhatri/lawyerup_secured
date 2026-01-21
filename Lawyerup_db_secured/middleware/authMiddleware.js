const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getAccessToken, clearAccessTokenCookie } = require('../utils/cookieHelpers');

/**
 * Main auth middleware
 * 
 * Security: Reads token from httpOnly cookie first (preferred),
 * falls back to Authorization header for backward compatibility.
 * 
 * Session Expiry Handling:
 * - JWT tokens have built-in expiry (7 days)
 * - Expired tokens are rejected and user must re-authenticate
 * - Cookie is automatically cleared by browser on expiry
 */
const auth = async (req, res, next) => {
  // Get token from cookie first, then Authorization header (backward compatibility)
  const token = getAccessToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    // Verify token and check expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token has expired (JWT library handles this, but explicit check for clarity)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      // Token expired - clear cookie and force re-authentication
      clearAccessTokenCookie(res);
      return res.status(401).json({ 
        message: 'Session expired. Please login again',
        sessionExpired: true
      });
    }

    // Load user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      // User not found - clear cookie and reject
      clearAccessTokenCookie(res);
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    // Handle different JWT error types
    if (err.name === 'TokenExpiredError') {
      // Token expired - clear cookie and force re-authentication
      clearAccessTokenCookie(res);
      return res.status(401).json({ 
        message: 'Session expired. Please login again',
        sessionExpired: true
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      // Invalid token format - clear cookie if present
      clearAccessTokenCookie(res);
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }

    // Other errors
    console.error('[Auth Middleware Error]', err);
    clearAccessTokenCookie(res);
    return res.status(403).json({ message: 'Forbidden: Token verification failed' });
  }
};

// Admin auth wrapper — uses your existing auth middleware
const adminAuth = async (req, res, next) => {
  await auth(req, res, async () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }
    next();
  });
};


module.exports = auth;        // for `auth` middleware
module.exports.adminAuth = adminAuth;  // to support `require().adminAuth`
