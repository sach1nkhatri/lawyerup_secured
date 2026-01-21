const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { deleteMyAccount } = require('../controllers/deleteAccountController');

// 🔐 DELETE /api/delete/account
router.delete('/account', authMiddleware, deleteMyAccount);

module.exports = router;
