const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditLogStats } = require('../controllers/auditController');
const adminAuth = require('../middleware/authMiddleware').adminAuth;

/**
 * Admin Audit Log Routes
 * 
 * RBAC Protection:
 * - All routes require admin authentication
 * - Only administrators can access audit logs
 * - Prevents unauthorized access to sensitive security data
 * 
 * Forensic Value:
 * - Audit logs provide immutable record of security events
 * - Essential for incident investigation and compliance
 * - Helps identify attack patterns and suspicious activity
 */

// GET /api/admin/audit-logs - Get audit logs with filtering and pagination
// RBAC: Admin only
router.get('/audit-logs', adminAuth, getAuditLogs);

// GET /api/admin/audit-logs/stats - Get audit log statistics
// RBAC: Admin only
router.get('/audit-logs/stats', adminAuth, getAuditLogStats);

module.exports = router;

