const { z } = require('zod');
const { commonSchemas } = require('./inputValidation');

/**
 * Validation Schemas for Common Endpoints
 * 
 * OWASP Top 10 Reference: A03:2021 – Injection
 * 
 * Example schemas for common API endpoints.
 * Use these as templates and customize as needed.
 */

// Login validation schema
const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, 'Password is required')
});

// Registration validation schema
const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .trim(),
  email: commonSchemas.email,
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
  contactNumber: z.string()
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .min(10, 'Phone number too short')
    .max(20, 'Phone number too long'),
  role: z.enum(['user', 'lawyer', 'admin']).optional()
});

// Change password validation schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
});

// MFA verification schema
const mfaVerifySchema = z.object({
  mfaToken: z.string().min(1, 'MFA token is required'),
  code: z.string().length(6, 'TOTP code must be 6 digits').optional(),
  recoveryCode: z.string().min(8, 'Recovery code must be at least 8 characters').optional()
}).refine(data => data.code || data.recoveryCode, {
  message: 'Either code or recoveryCode is required'
});

// Update profile schema
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  contactNumber: z.string()
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .optional(),
  city: z.string().max(100).trim().optional(),
  state: z.string().max(100).trim().optional(),
  address: z.string().max(500).trim().optional()
});

// Pagination query schema
const paginationQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val) || 1),
  limit: z.string().optional().transform(val => Math.min(200, Math.max(1, parseInt(val) || 50))),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  mfaVerifySchema,
  updateProfileSchema,
  paginationQuerySchema
};

