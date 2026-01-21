const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  updateProfile, 
  getAllUsers,
  registerAdmin,
  loginAdmin,
  updateUserStatus,
  mfaSetup,
  mfaConfirm,
  mfaVerify,
  mfaDisable
} = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const adminAuth = require('../middleware/authMiddleware').adminAuth;
const { loginLimiter, mfaLimiter } = require('../middleware/rateLimiters');

router.post('/signup', register);
// Apply rate limiting to login endpoint to prevent brute-force attacks
// Security: Limits to 5 attempts per 15 minutes per IP address
router.post('/login', loginLimiter, login);

// 🔐 Authenticated user route
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



// 🚧 Temporary: Unprotected for development
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/admin/users', adminAuth, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.get('/all-users', adminAuth, getAllUsers);
router.patch('/status/:id', adminAuth, updateUserStatus);
router.patch('/update-profile', auth, updateProfile);
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);

// ==================== MFA (Multi-Factor Authentication) Routes ====================
// POST /api/auth/mfa/setup - Generate TOTP secret and QR code (requires auth)
router.post('/mfa/setup', auth, mfaSetup);

// POST /api/auth/mfa/confirm - Confirm MFA setup with TOTP code (requires auth)
router.post('/mfa/confirm', auth, mfaConfirm);

// POST /api/auth/mfa/verify - Verify MFA code after login (uses mfaToken, not normal auth)
// Apply rate limiting to prevent brute-force attacks on MFA codes
// Security: Limits to 5 attempts per 10 minutes per IP address
router.post('/mfa/verify', mfaLimiter, mfaVerify);

// POST /api/auth/mfa/disable - Disable MFA (requires auth + password + TOTP/recovery code)
router.post('/mfa/disable', auth, mfaDisable);

module.exports = router;
