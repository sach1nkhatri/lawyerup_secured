const User = require('../models/User');
const Payment = require('../models/payment');

//  Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

//  Manually override plan and validity
const overridePlan = async (req, res) => {
  const { plan, validUntil } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { plan, validUntil },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Plan overridden', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to override plan' });
  }
};

//  Reset to Free plan
const resetPlan = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { plan: 'Free Trial', validUntil: null },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Plan reset to Free Trial', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset plan' });
  }
};

//  Extend validity by X days
const extendValidity = async (req, res) => {
  const { days } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const current = user.validUntil ? new Date(user.validUntil) : new Date();
    const extended = new Date(current.getTime() + days * 24 * 60 * 60 * 1000);
    user.validUntil = extended;

    await user.save();
    res.json({ message: 'Validity extended', validUntil: user.validUntil });
  } catch (err) {
    res.status(500).json({ error: 'Failed to extend validity' });
  }
};

//  Get all manual payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('user', 'fullName email');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

//  Approve a payment
const approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment approved', payment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve payment' });
  }
};

//  Reject a payment
const rejectPayment = async (req, res) => {
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

//  Hold a payment
const holdPayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'hold' },
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment put on hold', payment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to hold payment' });
  }
};

module.exports = {
  getAllUsers,
  overridePlan,
  resetPlan,
  extendValidity,
  getPayments,
  approvePayment,
  rejectPayment,
  holdPayment
};
