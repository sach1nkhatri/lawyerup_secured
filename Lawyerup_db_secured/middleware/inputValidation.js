const { z } = require('zod');
const { logAccessDenied } = require('../utils/auditLogger');

/**
 * Input Validation Middleware
 * 
 * OWASP Top 10 Reference: A03:2021 – Injection
 * 
 * Validates and sanitizes user input to prevent:
 * - SQL Injection
 * - NoSQL Injection
 * - Command Injection
 * - XSS (Cross-Site Scripting)
 * - Path Traversal
 * 
 * Uses Zod for schema-based validation with type safety.
 */

/**
 * Create validation middleware from Zod schema
 * @param {z.ZodSchema} schema - Zod schema for validation
 * @param {String} source - Source of data: 'body', 'query', 'params' (default: 'body')
 * @returns {Function} Express middleware function
 */
const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      // Get data from specified source
      const data = req[source];
      
      // Validate data against schema
      // Zod will throw an error if validation fails
      const validatedData = await schema.parseAsync(data);
      
      // Replace original data with validated data
      req[source] = validatedData;
      
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        // Log validation failure
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
          || req.connection.remoteAddress 
          || req.ip 
          || 'unknown';
        const userAgent = req.headers['user-agent'] || null;
        
        await logAccessDenied(
          req.user?._id?.toString() || null,
          req.user?.role || null,
          clientIp,
          userAgent,
          req.path,
          `input_validation_failed: ${error.errors.map(e => e.path.join('.')).join(', ')}`
        );
        
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      
      // Handle other errors
      console.error('[Input Validation Error]', error);
      res.status(500).json({ message: 'Validation error', error: 'VALIDATION_ERROR' });
    }
  };
};

/**
 * Common validation schemas
 * Can be reused across different endpoints
 */
const commonSchemas = {
  // Email validation
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(255, 'Email too long'),
  
  // Password validation (basic - detailed validation in passwordPolicy.js)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
  
  // ObjectId validation (MongoDB)
  objectId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  
  // IP address validation
  ipAddress: z.string()
    .ip('Invalid IP address format'),
  
  // URL validation
  url: z.string()
    .url('Invalid URL format'),
  
  // Safe string (alphanumeric + spaces, no special chars)
  safeString: z.string()
    .regex(/^[a-zA-Z0-9\s]+$/, 'Contains invalid characters')
    .trim(),
  
  // Positive integer
  positiveInt: z.number()
    .int('Must be an integer')
    .positive('Must be positive'),
  
  // Non-negative integer
  nonNegativeInt: z.number()
    .int('Must be an integer')
    .nonnegative('Must be non-negative'),
  
  // Date string
  dateString: z.string()
    .datetime('Invalid date format'),
  
  // Pagination parameters
  pagination: z.object({
    page: z.string().optional().transform(val => parseInt(val) || 1),
    limit: z.string().optional().transform(val => Math.min(200, Math.max(1, parseInt(val) || 50)))
  })
};

/**
 * Sanitize string to prevent XSS
 * @param {String} str - String to sanitize
 * @returns {String} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove potentially dangerous characters
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  
  return sanitized;
};

/**
 * Sanitization middleware
 * Sanitizes request body, query, and params to prevent XSS
 * 
 * OWASP Top 10 Reference: A03:2021 – Injection (XSS Protection)
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = {
  validate,
  commonSchemas,
  sanitizeString,
  sanitizeObject,
  sanitizeInput
};

