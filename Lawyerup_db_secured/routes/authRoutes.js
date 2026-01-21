const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getAllUsers } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const { registerAdmin } = require('../controllers/authController');
const { loginAdmin } = require('../controllers/authController');
const adminAuth = require('../middleware/authMiddleware').adminAuth; 
const { updateUserStatus } = require('../controllers/authController');

router.post('/signup', register);
router.post('/login', login);

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

module.exports = router;
