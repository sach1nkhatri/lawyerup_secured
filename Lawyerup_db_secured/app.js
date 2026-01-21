// app.js
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');

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

app.use(cors({
  origin: '*',
  credentials: true // Required for httpOnly cookies
}));
app.use(cookieParser()); // Parse cookies from request
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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

module.exports = app;
