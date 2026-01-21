const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/', analyticsController.getAnalyticsData); // now matches /api/analytics
router.get('/lifetime', analyticsController.getLifetimeAnalytics); // matches /api/analytics/lifetime

module.exports = router;
