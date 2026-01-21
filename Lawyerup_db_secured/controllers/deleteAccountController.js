const User = require('../models/User');
const Chat = require('../models/chat');
const Booking = require('../models/Booking');
const Lawyer = require('../models/Lawyer');

const deleteMyAccount = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    // 🧹 Step 1: Delete Law AI chat data
    await Chat.deleteMany({ user: userId });

    if (role === 'user') {
      // 🔗 Unlink user from bookings
      await Booking.updateMany({ user: userId }, { $unset: { user: "" } });

    } else if (role === 'lawyer') {
      // 🔗 Unlink lawyer from bookings
      await Booking.updateMany({ lawyer: userId }, { $unset: { lawyer: "" } });

      // ❌ Disable lawyer listing
      await Lawyer.updateOne({ user: userId }, { $set: { status: 'disabled' } });
    }

    // 🗑️ Final: Delete user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account and related data deleted successfully.' });
  } catch (err) {
    console.error('Account deletion failed:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

module.exports = { deleteMyAccount };
