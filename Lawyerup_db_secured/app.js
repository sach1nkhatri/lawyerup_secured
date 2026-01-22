// app.js
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');

// Security middlewares
const securityHeaders = require('./middleware/securityHeaders');
const { sanitizeInput } = require('./middleware/inputValidation');
const { logAccessDenied } = require('./utils/auditLogger');
const multer = require('multer');

// Load env first
dotenv.config();

// Routes
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const lawyerRoutes = require('./routes/LawyerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const faqRoutes = require('./routes/faqRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); 
const adminControlRoutes = require('./routes/adminControlRoutes');
const aiRoutes = require('./routes/aiRoutes');
const deleteRoutes = require('./routes/deleteRoutes');
const analyticsRoutes = require('./routes/analytics');
const auditRoutes = require('./routes/auditRoutes');

// Express setup
const app = express();

// ==================== Security Middlewares ====================
// OWASP Top 10 Reference: A05:2021 – Security Misconfiguration

// 1. Security Headers (Helmet)
// Sets secure HTTP headers to protect against common vulnerabilities
// OWASP: A05:2021 – Security Misconfiguration
app.use(securityHeaders);

// 2. CORS Configuration
// OWASP: A05:2021 – Security Misconfiguration
// IMPORTANT: When credentials: true, origin cannot be '*' - must specify origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:3000', 'http://localhost:3001']; // Default for development
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow localhost origins
      if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true, // Required for httpOnly cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token']
};

app.use(cors(corsOptions));

// 3. Cookie Parser
app.use(cookieParser());

// 4. Body Parsing with size limits
// OWASP: A03:2021 – Injection (Prevent DoS via large payloads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. CSRF Protection
// Protects state-changing routes from CSRF attacks
// OWASP: A01:2021 – Broken Access Control
const { csrfProtection, addCsrfToken } = require('./middleware/csrfProtection');
// Add CSRF token to all responses (sets cookie)
app.use(addCsrfToken);
// Protect state-changing routes with CSRF validation
app.use(csrfProtection);

// 6. Input Sanitization
// Sanitizes user input to prevent XSS and injection attacks
// OWASP: A03:2021 – Injection
app.use(sanitizeInput);

// 6. Static file serving (with security considerations)
// OWASP: A01:2021 – Broken Access Control (Prevent directory traversal)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => console.error('Mongo error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/manual-payment', paymentRoutes);
app.use('/api/admin-control', adminControlRoutes);
app.use('/api/admin', auditRoutes); // Admin audit logs (RBAC protected)
app.use('/api/delete', deleteRoutes);
app.use('/api/analytics', analyticsRoutes);

// ==================== Error Handling Middleware ====================
// OWASP: A05:2021 – Security Misconfiguration (Proper error handling)

// Handle Multer errors (file upload errors)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Log rejected file upload
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
      || req.connection.remoteAddress 
      || req.ip 
      || 'unknown';
    const userAgent = req.headers['user-agent'] || null;
    
    logAccessDenied(
      req.user?._id?.toString() || null,
      req.user?.role || null,
      clientIp,
      userAgent,
      req.path,
      `file_upload_error: ${err.code}`
    );
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large',
        error: 'FILE_TOO_LARGE'
      });
    }
    
    return res.status(400).json({ 
      message: 'File upload error',
      error: err.code
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error',
      error: err.message
    });
  }
  
  // Handle other errors
  console.error('[Application Error]', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'INTERNAL_ERROR' : err.message
  });
});

module.exports = app;
