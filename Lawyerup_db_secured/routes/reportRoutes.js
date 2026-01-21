const express = require('express');
const router = express.Router();
const {
  submitReport,
  getAllReports,
  updateReportStatus
} = require('../controllers/reportController');

router.post('/', submitReport); // submit
router.get('/', getAllReports); // load all
router.patch('/:id/status', updateReportStatus); // update status

module.exports = router;
