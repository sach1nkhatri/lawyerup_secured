const Booking = require('../models/Booking');
const Lawyer = require('../models/Lawyer');

const submitReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { user, comment, rating } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const lawyerDoc = await Lawyer.findOne({ user: booking.lawyer });
    if (!lawyerDoc) return res.status(404).json({ message: 'Lawyer not found' });

    lawyerDoc.reviews.push({ user, comment, rating });
    await lawyerDoc.save();

    res.status(200).json({ message: 'Review submitted successfully ✅' });
  } catch (err) {
    console.error('Review Error:', err);
    res.status(500).json({ message: 'Server error during review submission' });
  }
};

module.exports = { submitReview };
