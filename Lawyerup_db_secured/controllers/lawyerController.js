const express = require('express');
const router = express.Router();
const Lawyer = require('../models/Lawyer');

// GET /api/lawyers/by-user?email=... OR ?contactNumber=...
router.get('/by-user', async (req, res) => {
  try {
    const { email, contactNumber } = req.query;

    if (!email && !contactNumber) {
      return res.status(400).json({ message: 'Email or contactNumber is required' });
    }

    const filter = {};
    if (email) filter.email = email;
    if (contactNumber) filter.phone = contactNumber;

    const lawyer = await Lawyer.findOne(filter);
    if (!lawyer) {
      return res.status(404).json({ message: 'No lawyer application found.' });
    }

    res.status(200).json(lawyer);
  } catch (err) {
    console.error('Error in GET /by-user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/lawyers
router.post('/', async (req, res) => {
  try {
    const {
      fullName, specialization, email, phone, state, city, address,
      qualification, profilePhoto, licenseFile, schedule,
      description, specialCase, socialLink,
      education, workExperience
    } = req.body;

    if (!fullName || !email || !phone || !schedule || !description || !education?.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // check for existing application
    const existing = await Lawyer.findOne({
      $or: [{ email }, { phone }]
    });

    if (existing) {
      return res.status(400).json({ message: 'User has already applied.' });
    }

    const newLawyer = new Lawyer({
      fullName, specialization, email, phone, state, city, address,
      qualification, profilePhoto, licenseFile,
      schedule: typeof schedule === 'string' ? JSON.parse(schedule) : schedule,
      description, specialCase, socialLink,
      education, workExperience,
      status: 'pending' // required for tracking
    });

    await newLawyer.save();
    res.status(201).json({ message: 'Application submitted', lawyer: newLawyer });
  } catch (error) {
    console.error('Error creating lawyer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
