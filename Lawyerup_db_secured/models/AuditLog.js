const mongoose = require('mongoose');

/**
 * Audit Log Model
 * 
 * Stores security-sensitive actions for forensic analysis and compliance.
 * 
 * Forensic Value:
 * - Timestamp: Establishes timeline of events for incident investigation
 * - IP Address: Identifies source of requests, detects suspicious patterns
 * - User Agent: Helps identify device/browser used, detect anomalies
 * - Action Type: Categorizes events for filtering and analysis
 * - User ID/Role: Links actions to specific users for accountability
 * - Metadata: Stores additional context (e.g., failed attempt reasons, lock duration)
 * 
 * Use Cases:
 * - Security incident investigation
 * - Compliance audits (GDPR, SOC 2, etc.)
 * - Detecting patterns of abuse
 * - User activity monitoring
 * - Legal evidence in case of breaches
 */

const auditLogSchema = new mongoose.Schema({
  // Action type (e.g., 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'ACCOUNT_LOCKED')
  action: {
    type: String,
    required: true,
    index: true // Indexed for faster queries
  },
  // User ID (null for anonymous actions like failed logins with unknown user)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true // Indexed for user-specific queries
  },
  // User role at time of action (for RBAC tracking)
  role: {
    type: String,
    enum: ['user', 'lawyer', 'admin'],
    default: null
  },
  // IP address of the request
  // Forensic: Identifies geographic location, detects VPN/proxy usage
  ipAddress: {
    type: String,
    required: true,
    index: true // Indexed for IP-based analysis
  },
  // User agent string from request headers
  // Forensic: Identifies browser/device, detects bot activity
  userAgent: {
    type: String,
    default: null
  },
  // Timestamp of the action (defaults to creation time)
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Indexed for time-based queries
  },
  // Additional metadata (flexible object for event-specific data)
  // Examples: { reason: 'invalid_password', failedAttempts: 5, lockUntil: '...' }
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  // TTL index: Automatically delete logs older than 1 year (365 days)
  // Adjust retention period based on compliance requirements
  expireAfterSeconds: 365 * 24 * 60 * 60 // 1 year retention
});

// Compound indexes for common query patterns
auditLogSchema.index({ userId: 1, timestamp: -1 }); // User activity timeline
auditLogSchema.index({ action: 1, timestamp: -1 }); // Action type over time
auditLogSchema.index({ ipAddress: 1, timestamp: -1 }); // IP activity tracking

module.exports = mongoose.model('AuditLog', auditLogSchema);

