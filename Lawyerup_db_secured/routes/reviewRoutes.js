const express = require('express');
const router = express.Router();
const { submitReview } = require('../controllers/reviewController');

router.post('/:bookingId', submitReview);

module.exports = router;
