const Report = require('../models/Report');

exports.submitReport = async (req, res) => {
    console.log('Incoming report body:', req.body); // 🔍 Log incoming data
  
    const { user, message } = req.body;
  
    if (!user || !message) {
      return res.status(400).json({ error: 'Missing user or message.' });
    }
  
    try {
      const report = new Report({ user, message });
      await report.save();
      res.status(201).json({ message: 'Report submitted successfully' });
    } catch (error) {
      console.error('Report save error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
};

// 📥 Get all reports with user info
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('user', 'fullName email role')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 🛠 Update report status (pending <-> fixed)
exports.updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'fixed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  try {
    const updated = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'fullName email');

    if (!updated) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ message: 'Report status updated', report: updated });
  } catch (error) {
    console.error('Status update failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};