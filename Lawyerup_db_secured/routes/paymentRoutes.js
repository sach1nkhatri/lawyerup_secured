const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const protect = require('../middleware/authMiddleware'); // ✅ your working base auth
const adminAuth = require('../middleware/authMiddleware').adminAuth; // ✅ load admin-only check

const paymentController = require('../controllers/paymentController');

// User uploads payment proof
router.post(
  '/',
  protect,
  upload.single('screenshot'),
  paymentController.submitManualPayment
);

// Admin routes
router.patch('/:id/approve', protect, paymentController.approvePayment);
router.patch('/:id/reject', protect, paymentController.rejectPayment);
router.get('/', adminAuth, paymentController.getAllPayments);
router.get('/user', protect, paymentController.getUserLatestPayment);
router.patch('/downgrade/expired', adminAuth, paymentController.downgradeExpiredUsers);
router.get('/users-with-payments', adminAuth, paymentController.getUsersWithPayments);

module.exports = router;
