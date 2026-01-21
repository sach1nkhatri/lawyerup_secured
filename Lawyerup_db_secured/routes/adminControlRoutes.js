const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  overridePlan,
  resetPlan,
  extendValidity,
  getPayments,
  approvePayment,
  rejectPayment,
  holdPayment
} = require('../controllers/adminControlController');

// Unprotected for dev
router.get('/users', getAllUsers);
router.patch('/users/:id/plan', overridePlan);
router.patch('/users/:id/reset', resetPlan);
router.patch('/users/:id/extend', extendValidity);

router.get('/payments', getPayments);
router.patch('/payments/:id/approve', approvePayment);
router.patch('/payments/:id/reject', rejectPayment);
router.patch('/payments/:id/hold', holdPayment);

module.exports = router;
