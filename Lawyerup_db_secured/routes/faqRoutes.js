const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// GET all
router.get('/', faqController.getAllFAQs);

// ADD
router.post('/', faqController.addFAQ);

// DELETE
router.delete('/:id', faqController.deleteFAQ);

module.exports = router;
