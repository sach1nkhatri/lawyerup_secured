const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Report = require('../models/Report');
const Payment = require('../models/payment');
const Analytics = require('../models/Analytics');
const moment = require('moment');

// 🧠 UTIL: Get month/year label for current date
const getCurrentMonthKey = () => {
  const now = moment();
  return {
    month: now.format('MMMM'),
    year: now.year()
  };
};

const getMonthLabel = (date) => {
  const d = new Date(date);
  return d.toLocaleString('default', { month: 'long' });
};

const normalizePlan = (plan) => { 
  if (!plan) return 'free';
  const p = plan.toLowerCase();
  if (p.includes('premium')) return 'premium';  
  if (p.includes('basic')) return 'basic';
  return 'free';
};

const initMonthData = (month) => ({
  month,
  free: 0,
  basic: { total: 0, daily: 0, weekly: 0, monthly: 0 },
  premium: { total: 0, daily: 0, weekly: 0, monthly: 0 },
  registeredUsers: 0,
  lawyers: { total: 0, junior: 0, senior: 0 },
  reports: 0
});

const calculateDuration = (start, end) =>
  Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));

/* --------------------------- MAIN CONTROLLERS --------------------------- */

// 📊 1. Get real-time analytics grouped by month
exports.getAnalyticsData = async (req, res) => {
  try {
    const [users, lawyers, reports, payments] = await Promise.all([
      User.find(),
      Lawyer.find(),
      Report.find(),
      Payment.find({ status: 'approved' })
    ]);

    const months = {};
    const userPaymentMap = new Map();

    for (const p of payments) {
      const key = String(p.user);
      if (!userPaymentMap.has(key)) userPaymentMap.set(key, []);
      userPaymentMap.get(key).push(p);
    }

    for (const u of users) {
      const month = getMonthLabel(u.createdAt);
      if (!months[month]) months[month] = initMonthData(month);

      months[month].registeredUsers++;

      const plan = normalizePlan(u.plan);
      const userId = String(u._id);

      if (plan === 'free') {
        months[month].free++;
        continue;
      }

      months[month][plan].total++;

      const userPayments = userPaymentMap.get(userId) || [];
      const latest = userPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0];

      if (latest) {
        const durationInDays = calculateDuration(latest.paymentDate, latest.validUntil);
        if (durationInDays <= 2) months[month][plan].daily++;
        else if (durationInDays <= 10) months[month][plan].weekly++;
        else months[month][plan].monthly++;
      } else {
        months[month][plan].daily++;
      }
    }

    for (const l of lawyers) {
      const user = await User.findById(l.user);
      if (!user) continue;

      const month = getMonthLabel(user.createdAt);
      if (!months[month]) months[month] = initMonthData(month);

      months[month].lawyers.total++;
      if (l.role === 'junior') months[month].lawyers.junior++;
      else months[month].lawyers.senior++;
    }

    for (const r of reports) {
      const month = getMonthLabel(r.createdAt || r.updatedAt || new Date());
      if (!months[month]) months[month] = initMonthData(month);
      months[month].reports++;
    }

    const sorted = Object.values(months).sort(
      (a, b) => new Date(`01 ${a.month} 2025`) - new Date(`01 ${b.month} 2025`)
    );

    res.json({ months: sorted });
  } catch (err) {
    console.error('Analytics Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// 📈 2. Get lifetime analytics
exports.getLifetimeAnalytics = async (req, res) => {
  try {
    const [users, lawyers, reports, payments] = await Promise.all([
      User.find(),
      Lawyer.find(),
      Report.find(),
      Payment.find({ status: 'approved' })
    ]);

    const lifetime = {
      totalUsers: users.length,
      totalLawyers: lawyers.length,
      totalReports: reports.length,
      totalPayments: payments.length,
      plans: {
        free: 0,
        basic: { total: 0, daily: 0, weekly: 0, monthly: 0 },
        premium: { total: 0, daily: 0, weekly: 0, monthly: 0 }
      }
    };

    const userLatestPayment = new Map();
    for (const p of payments) {
      const uid = String(p.user);
      if (!uid) continue;

      const existing = userLatestPayment.get(uid);
      if (!existing || new Date(p.paymentDate) > new Date(existing.paymentDate)) {
        userLatestPayment.set(uid, p);
      }
    }

    for (const u of users) {
      const plan = normalizePlan(u.plan);
      const userId = String(u._id);

      if (plan === 'free') {
        lifetime.plans.free++;
        continue;
      }

      lifetime.plans[plan].total++;
      const latest = userLatestPayment.get(userId);

      if (latest) {
        const duration = calculateDuration(latest.paymentDate, latest.validUntil);
        if (duration <= 2) lifetime.plans[plan].daily++;
        else if (duration <= 10) lifetime.plans[plan].weekly++;
        else lifetime.plans[plan].monthly++;
      } else {
        lifetime.plans[plan].daily++;
      }
    }

    res.json({ lifetime });
  } catch (err) {
    console.error('Lifetime Analytics Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------- PERSISTENT ANALYTICS ----------------------- */

// 🔄 Live update to persistent model
exports.updateAnalytics = async (updateFn) => {
  try {
    const { month, year } = getCurrentMonthKey();

    let doc = await Analytics.findOne({ month, year });
    if (!doc) {
      doc = await Analytics.create({ month, year });
    }

    if (doc.isFinalized) return;

    updateFn(doc); // e.g. doc.registeredUsers++; doc.basic.total++;
    await doc.save();
  } catch (err) {
    console.error('Live Analytics Update Error:', err.message);
  }
};

// 🧾 Finalize the current month
exports.finalizeAnalyticsMonth = async (req, res) => {
  try {
    const { month, year } = getCurrentMonthKey();
    const doc = await Analytics.findOne({ month, year });

    if (!doc) return res.status(404).json({ message: 'No analytics found' });

    doc.isFinalized = true;
    await doc.save();

    res.json({ message: `✅ Finalized analytics for ${month} ${year}` });
  } catch (err) {
    console.error('Finalize Analytics Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
