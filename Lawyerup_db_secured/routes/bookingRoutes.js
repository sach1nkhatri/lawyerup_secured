const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const { unlinkUserFromCompletedBookings} = require('../controllers/bookingController');

// ✅ Create new booking (includes lawyer + lawyerList)
router.post('/', bookingController.createBooking);

// ✅ Get bookings made by a user (includes lawyerList profile)
router.get('/user/:userId', bookingController.getBookingsByUser);

// ✅ Get bookings received by a lawyer (by lawyer User ID)
router.get('/lawyer/:lawyerId', bookingController.getBookingsByLawyer);

// ✅ Get available time slots (lawyerId = User ID)
router.get('/slots', bookingController.getAvailableSlots);

// ✅ Update status (pending → approved, etc.)
router.patch('/:id/status', bookingController.updateBookingStatus);

// ✅ Update meeting link (live or online)
router.patch('/:id/meeting-link', bookingController.updateMeetingLink);
//ula ula
router.delete('/:id', bookingController.deleteBooking);


router.post('/:bookingId/chat', bookingController.sendMessage);
router.get('/:bookingId/chat', bookingController.getMessages);
router.patch('/:bookingId/chat/read', bookingController.markMessagesAsRead);
router.patch('/clear-user-history', authMiddleware, unlinkUserFromCompletedBookings);


module.exports = router;
