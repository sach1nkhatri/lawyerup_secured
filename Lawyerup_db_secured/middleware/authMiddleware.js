const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Main auth middleware (you're using this as `auth`)
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
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
