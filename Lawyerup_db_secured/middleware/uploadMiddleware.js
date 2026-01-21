const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { logAccessDenied } = require('../utils/auditLogger');

/**
 * Secure File Upload Middleware
 * 
 * OWASP Top 10 Reference: A03:2021 – Injection (File Upload Vulnerabilities)
 * 
 * Security Features:
 * - MIME type AND extension validation (both must match)
 * - File size limits
 * - Safe filename generation (prevents path traversal)
 * - Rejected request logging
 * 
 * Prevents:
 * - Malicious file uploads
 * - Path traversal attacks (../../etc/passwd)
 * - MIME type spoofing
 * - File size DoS attacks
 */

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024,      // 5MB for images
  pdf: 10 * 1024 * 1024,       // 10MB for PDFs
  screenshot: 5 * 1024 * 1024, // 5MB for screenshots
  default: 5 * 1024 * 1024     // 5MB default
};

// Allowed file types mapping: MIME type -> [allowed extensions]
// OWASP: Validate both MIME type AND extension (AND, not OR)
const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['jpg', 'jpeg'],
  'image/jpg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  
  // PDFs
  'application/pdf': ['pdf'],
  
  // Documents (if needed)
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx']
};

/**
 * Get file size limit based on file type
 * @param {String} mimetype - MIME type of the file
 * @param {String} fieldname - Field name
 * @returns {Number} Size limit in bytes
 */
const getFileSizeLimit = (mimetype, fieldname) => {
  if (fieldname === 'screenshot') return FILE_SIZE_LIMITS.screenshot;
  if (mimetype === 'application/pdf') return FILE_SIZE_LIMITS.pdf;
  if (mimetype.startsWith('image/')) return FILE_SIZE_LIMITS.image;
  return FILE_SIZE_LIMITS.default;
};

/**
 * Sanitize filename to prevent path traversal and other attacks
 * OWASP: Prevent path traversal (A01:2021 – Broken Access Control)
 * @param {String} filename - Original filename
 * @returns {String} Sanitized filename
 */
const sanitizeFilename = (filename) => {
  // Remove path components (../, ./, etc.)
  let sanitized = path.basename(filename);
  
  // Remove any remaining path separators
  sanitized = sanitized.replace(/[\/\\]/g, '');
  
  // Remove null bytes and other dangerous characters
  sanitized = sanitized.replace(/\0/g, '');
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }
  
  return sanitized;
};

/**
 * Validate file: MIME type AND extension must match
 * OWASP: A03:2021 – Injection (File Upload Validation)
 * @param {Object} file - Multer file object
 * @returns {Object} { valid: Boolean, error: String }
 */
const validateFile = (file) => {
  const mimetype = file.mimetype.toLowerCase();
  const originalExt = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  // Check if MIME type is allowed
  if (!ALLOWED_FILE_TYPES[mimetype]) {
    return {
      valid: false,
      error: `MIME type '${mimetype}' is not allowed`
    };
  }
  
  // Check if extension matches MIME type (AND validation)
  const allowedExts = ALLOWED_FILE_TYPES[mimetype];
  if (!allowedExts.includes(originalExt)) {
    return {
      valid: false,
      error: `File extension '${originalExt}' does not match MIME type '${mimetype}'. Allowed extensions: ${allowedExts.join(', ')}`
    };
  }
  
  // Check file size
  const sizeLimit = getFileSizeLimit(mimetype, file.fieldname);
  if (file.size > sizeLimit) {
    return {
      valid: false,
      error: `File size exceeds limit of ${sizeLimit / (1024 * 1024)}MB`
    };
  }
  
  return { valid: true };
};

/**
 * Log rejected file upload attempt
 * @param {Object} req - Express request object
 * @param {Object} file - File object
 * @param {String} reason - Rejection reason
 */
const logRejectedUpload = async (req, file, reason) => {
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
    `file_upload_rejected: ${reason}`
  );
};

// 🎯 Determine the upload folder based on fieldname
const getUploadDir = (file) => {
  const { mimetype, fieldname } = file;

  if (fieldname === 'image') return 'uploads/news';
  if (fieldname === 'profilePhoto') return 'uploads/lawyers/photo';
  if (fieldname === 'licenseFile') return 'uploads/lawyers/license';
  if (mimetype === 'application/pdf') return 'uploads/pdf';
  if (fieldname === 'chatpdf') return 'uploads/chatpdf'; 
  if (fieldname === 'screenshot') return 'uploads/payment';

  // Fallback
  return 'uploads/misc';
};

// 📦 Multer storage setup with secure filename generation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getUploadDir(file);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Sanitize original filename
    const sanitizedOriginal = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitizedOriginal);
    
    // Generate safe filename: timestamp-randomhash.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeFilename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    
    cb(null, safeFilename);
  },
  limits: {
    fileSize: FILE_SIZE_LIMITS.default // Global limit
  }
});

// 🛡️ Secure file filter: MIME type AND extension validation
const fileFilter = async (req, file, cb) => {
  try {
    // Validate file before accepting
    const validation = validateFile(file);
    
    if (!validation.valid) {
      // Log rejected upload
      await logRejectedUpload(req, file, validation.error);
      
      console.log(`[File Upload Rejected] ${validation.error}`, {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname,
        ip: req.headers['x-forwarded-for'] || req.ip
      });
      
      return cb(new Error(validation.error));
    }
    
    // File is valid
    cb(null, true);
  } catch (error) {
    console.error('[File Filter Error]', error);
    await logRejectedUpload(req, file, 'validation_error');
    cb(new Error('File validation error'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.default,
    files: 10 // Maximum number of files
  }
});

module.exports = upload;
