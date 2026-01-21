const Payment = require('../models/payment');
const path = require('path');
const User = require('../models/User');

// Create new payment
exports.submitManualPayment = async (req, res) => {
  try {
    const { plan, amount, method, duration } = req.body;
    const userId = req.user._id;
    const filePath = req.file?.path;

    if (!filePath) return res.status(400).json({ error: 'Screenshot is required' });

    const days = {
      daily: 1,
      weekly: 7,
      monthly: 30
    }[duration.toLowerCase()] || 30;

    const validUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const payment = await Payment.create({
      user: userId,
      plan,
      amount,
      method,
      screenshot: filePath.replace(/\\/g, '/'),
      validUntil
    });

    res.status(201).json({ message: 'Payment submitted', payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin approval
exports.approvePayment = async (req, res) => {
  try {
    // Approve the payment
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Sync user plan with payment plan
    const user = await User.findById(payment.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.plan = payment.plan;
    await user.save();

    res.json({ message: 'Payment approved and user plan updated', payment });
  } catch (err) {
    console.error('[❌ Approve Payment Error]', err);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
};


// Admin rejection
exports.rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment rejected', payment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject payment' });
  }
};

// Get all payments (admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('user', 'fullName email');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};
exports.getUserLatestPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (!payment) return res.status(404).json({ message: 'No payment found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user payment' });
  }
};



exports.downgradeExpiredUsers = async (req, res) => {
  try {
    const now = new Date();
    const expiredPayments = await Payment.find({
      status: 'approved',
      validUntil: { $lt: now }
    });

    const updatedUserIds = [];

    for (const payment of expiredPayments) {
      const userId = payment.user;

      const user = await User.findById(userId);
      if (user && user.plan !== 'Free Trial') {
        user.plan = 'Free Trial';
        await user.save();
        updatedUserIds.push(user.email);
      }

      // 🔁 Update payment status to 'expired'
      payment.status = 'expired';
      await payment.save();

      // 🆕 Additional Task (doesn't break previous logic)
      // Example: Create a log, notify, cleanup, etc.
      await SomeModel.create({
        user: userId,
        reason: 'Payment expired and plan downgraded',
        timestamp: now,
      });

      // or: await notifyUser(user.email, 'Your plan expired', 'Please renew to continue using Premium features.');
    }

    res.json({
      message: 'Expired users downgraded and payment statuses updated.',
      users: updatedUserIds
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to downgrade users' });
  }
};



exports.getUsersWithPayments = async (req, res) => {
  try {
    const users = await User.find().lean();
    const allPayments = await Payment.find({ status: 'approved' }).sort({ createdAt: -1 });

    const userPaymentMap = {};
    for (const payment of allPayments) {
      const uid = payment.user.toString();
      if (!userPaymentMap[uid]) {
        userPaymentMap[uid] = {
          plan: payment.plan,
          validUntil: payment.validUntil,
          paymentDate: payment.paymentDate,
          method: payment.method
        };
      }
    }

    const merged = users.map(u => ({
      ...u,
      latestPayment: userPaymentMap[u._id.toString()] || null
    }));

    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get user payment info' });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // optional: exclude password
    res.status(200).json(users);
  } catch (err) {
    console.error('[❌ Get All Users Failed]', err);
    res.status(500).json({ message: 'Server error' });
  }
};
