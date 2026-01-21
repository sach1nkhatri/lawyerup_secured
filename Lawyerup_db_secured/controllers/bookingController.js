const Booking = require('../models/Booking');
const Lawyer = require('../models/Lawyer');
const { generateAvailableSlots } = require('../utils/slotUtils');
const { encrypt, decrypt } = require('../utils/customEncrypter');


exports.createBooking = async (req, res) => {
  try {
    const {
      user,
      lawyer,
      lawyerList,
      date,
      time,
      duration = 1,
      mode,
      description,
    } = req.body;

    if (!user || !lawyer || !lawyerList || !date || !time || !duration) {
      return res.status(400).json({ message: 'Missing required booking details' });
    }

    const newStart = toMinutes(time);
    const newEnd = newStart + duration * 60;

    const existing = await Booking.find({ lawyer, date });

    const conflict = existing.some(b => {
      const existingStart = toMinutes(b.time);
      const existingEnd = existingStart + b.duration * 60;
      return !(newEnd <= existingStart || newStart >= existingEnd);
    });

    if (conflict) {
      return res.status(409).json({ message: 'Time slot already booked. Please choose another.' });
    }

    const booking = await Booking.create({
      user,
      lawyer,
      lawyerList,
      date,
      time,
      duration,
      mode,
      description,
      status: 'pending',
      reviewed: false,
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation failed:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

function toMinutes(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}


// 📌 Get all bookings for a user with populated lawyer data
// GET /api/bookings/user/:userId
exports.getBookingsByUser = async (req, res) => {
    try {
      const bookings = await Booking.find({ user: req.params.userId })
        .populate('user', 'fullName email contactNumber role') // 👤 Client info
        .populate('lawyer', 'fullName email contactNumber  specialization qualification profilePhoto role') // 👨‍⚖️ Lawyer info
        .populate('lawyerList', 'specialization qualification contact phone rate profilePhoto schedule'); // 📋 Lawyer listing (user-facing card)
  
      res.json(bookings);
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      res.status(500).json({ message: 'Failed to fetch user bookings' });
    }
  };
  
  
  
  
  

// 📌 Get all bookings for a lawyer with populated user data
exports.getBookingsByLawyer = async (req, res) => {
    try {
      const bookings = await Booking.find({ lawyer: req.params.lawyerId })
        .populate('user', 'fullName email contactNumber')
        .populate('lawyer', 'fullName email phone specialization qualification address profilePhoto');
      res.json(bookings);
    } catch (error) {
      console.error('Failed to fetch lawyer bookings:', error);
      res.status(500).json({ message: 'Failed to fetch lawyer bookings' });
    }
  };
  

// 📌 Generate available time slots for booking
exports.getAvailableSlots = async (req, res) => {
  try {
    const { lawyerId, date, duration } = req.query;

    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) return res.status(404).json({ message: 'Lawyer not found' });

    const weekday = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const availability = lawyer.schedule[weekday] || [];

    const existingBookings = await Booking.find({ lawyer: lawyerId, date });

    const slots = generateAvailableSlots(availability, existingBookings, parseInt(duration));
    res.json(slots);
  } catch (err) {
    console.error("Slot generation failed:", err);
    res.status(500).json({ message: 'Failed to generate available slots' });
  }
};

// 📌 Update booking status (approve, complete, cancel)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (error) {
    console.error('Failed to update booking status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

// 📌 Update the meeting link
exports.updateMeetingLink = async (req, res) => {
  try {
    const { meetingLink } = req.body;
    const updated = await Booking.findByIdAndUpdate(req.params.id, { meetingLink }, { new: true });
    res.json(updated);
  } catch (error) {
    console.error('Failed to update meeting link:', error);
    res.status(500).json({ message: 'Failed to update link' });
  }
};
// ❌ Delete a booking
exports.deleteBooking = async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
        console.error('Delete failed:', err);
        res.status(500).json({ message: 'Failed to delete booking' });
    }
};



exports.getMessages = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId)
      .populate('messages.sender', 'fullName email')
      .select('messages');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const decryptedMessages = booking.messages.map(msg => ({
      ...msg.toObject(),
      text: decrypt(msg.text)
    }));

    res.status(200).json(decryptedMessages);
  } catch (err) {
    console.error('Fetch messages failed:', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
};

// exports.getMessages = async (req, res) => {
//   const { bookingId } = req.params;

//   try {
//     const booking = await Booking.findById(bookingId)
//       .populate('messages.sender', 'fullName email') // so we can show names
//       .select('messages');

//     if (!booking) {
//       return res.status(404).json({ error: 'Booking not found' });
//     }

//     res.status(200).json(booking.messages);
//   } catch (err) {
//     console.error('Fetch messages failed:', err);
//     res.status(500).json({ error: 'Failed to load messages' });
//   }
// };


// 📩 Send a chat message for a booking
exports.sendMessage = async (req, res) => {
  const { bookingId } = req.params;
  const { senderId, text } = req.body;

  if (!text || !senderId) {
    return res.status(400).json({ error: 'Missing text or senderId' });
  }

  try {
    const encryptedText = encrypt(text);

    const message = {
      sender: senderId,
      text: encryptedText,
      timestamp: new Date(),
      status: 'sent'
    };

    await Booking.findByIdAndUpdate(
      bookingId,
      { $push: { messages: message } },
      { new: true }
    );

    const populatedMsg = await Booking.findById(bookingId)
      .select({ messages: { $slice: -1 } })
      .populate('messages.sender', 'fullName email');

    const msg = populatedMsg.messages[0];
    msg.text = decrypt(msg.text); // 🔓 Decrypt before sending back

    res.status(200).json(msg);
  } catch (err) {
    console.error('Send message failed:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// exports.sendMessage = async (req, res) => {
//   const { bookingId } = req.params;
//   const { senderId, text } = req.body;

//   if (!text || !senderId) {
//     return res.status(400).json({ error: 'Missing text or senderId' });
//   }

//   try {
//     const message = {
//       sender: senderId,
//       text,
//       timestamp: new Date(),
//       status: 'sent'
//     };

//     const booking = await Booking.findByIdAndUpdate(
//       bookingId,
//       { $push: { messages: message } },
//       { new: true }
//     );

//     const populatedMsg = await Booking.findById(bookingId)
//       .select({ messages: { $slice: -1 } })
//       .populate('messages.sender', 'fullName email');

//     res.status(200).json(populatedMsg.messages[0]); // return last pushed message
//   } catch (err) {
//     console.error('Send message failed:', err);
//     res.status(500).json({ error: 'Failed to send message' });
//   }
// };

exports.markMessagesAsRead = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const updated = await Booking.updateOne(
      { _id: bookingId },
      { $set: { 'messages.$[].status': 'read' } }
    );
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('Mark read failed:', err);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};


// 🧹 Unlink user ID from completed bookings (for clean UI/history)
// 🧹 Unlink user from completed bookings (for UI cleanup, analytics safe)
exports.unlinkUserFromCompletedBookings = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await Booking.updateMany(
      { user: userId, status: 'completed' },
      { $unset: { user: "" } }
    );

    res.status(200).json({
      message: 'User unlinked from completed bookings',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Failed to unlink user from completed bookings:', error);
    res.status(500).json({ message: 'Failed to unlink completed bookings' });
  }
};

