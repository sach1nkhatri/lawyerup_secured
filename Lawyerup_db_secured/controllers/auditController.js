const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

/**
 * GET /api/admin/audit-logs
 * Retrieve audit logs with filtering and pagination
 * Requires admin authentication (RBAC protection)
 * 
 * Forensic Value:
 * - Enables administrators to investigate security incidents
 * - Supports compliance audits and legal requirements
 * - Helps identify patterns of abuse or suspicious activity
 * - Provides accountability trail for user actions
 */
exports.getAuditLogs = async (req, res) => {
  try {
    // Extract query parameters for filtering and pagination
    const {
      action,           // Filter by action type (e.g., 'LOGIN_FAILED')
      userId,           // Filter by user ID
      ipAddress,        // Filter by IP address
      startDate,        // Start date for date range filter
      endDate,          // End date for date range filter
      page = 1,         // Page number (default: 1)
      limit = 50,       // Results per page (default: 50, max: 200)
      sortBy = 'timestamp', // Sort field (default: timestamp)
      sortOrder = 'desc'     // Sort order: 'asc' or 'desc' (default: desc)
    } = req.query;

    // Build query filter
    const filter = {};

    // Filter by action type
    if (action) {
      filter.action = action;
    }

    // Filter by user ID
    if (userId) {
      filter.userId = userId;
    }

    // Filter by IP address
    if (ipAddress) {
      filter.ipAddress = ipAddress;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Validate and sanitize pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Validate sort parameters
    const validSortFields = ['timestamp', 'action', 'userId', 'ipAddress'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'timestamp';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    // Execute query with pagination
    const [logs, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'email fullName role') // Populate user details
        .lean(), // Use lean() for better performance
      AuditLog.countDocuments(filter)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      logs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        action,
        userId,
        ipAddress,
        startDate,
        endDate
      }
    });
  } catch (err) {
    console.error('[Get Audit Logs Error]', err);
    res.status(500).json({ message: 'Failed to retrieve audit logs', error: err.message });
  }
};

/**
 * GET /api/admin/audit-logs/stats
 * Get audit log statistics for dashboard
 * Requires admin authentication (RBAC protection)
 */
exports.getAuditLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Get statistics
    const [
      totalLogs,
      loginSuccessCount,
      loginFailedCount,
      accountLockedCount,
      mfaSetupCount,
      passwordChangeCount,
      accessDeniedCount,
      topActions,
      topIPs
    ] = await Promise.all([
      // Total logs
      AuditLog.countDocuments(dateFilter),
      
      // Login success
      AuditLog.countDocuments({ ...dateFilter, action: 'LOGIN_SUCCESS' }),
      
      // Login failed
      AuditLog.countDocuments({ ...dateFilter, action: 'LOGIN_FAILED' }),
      
      // Account locked
      AuditLog.countDocuments({ ...dateFilter, action: 'ACCOUNT_LOCKED' }),
      
      // MFA setup
      AuditLog.countDocuments({ ...dateFilter, action: 'MFA_SETUP' }),
      
      // Password change
      AuditLog.countDocuments({ ...dateFilter, action: 'PASSWORD_CHANGE' }),
      
      // Access denied
      AuditLog.countDocuments({ ...dateFilter, action: 'ACCESS_DENIED' }),
      
      // Top actions (aggregation)
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Top IPs (aggregation)
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$ipAddress', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      summary: {
        totalLogs,
        loginSuccessCount,
        loginFailedCount,
        accountLockedCount,
        mfaSetupCount,
        passwordChangeCount,
        accessDeniedCount
      },
      topActions,
      topIPs,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
  } catch (err) {
    console.error('[Get Audit Log Stats Error]', err);
    res.status(500).json({ message: 'Failed to retrieve audit log statistics', error: err.message });
  }
};

