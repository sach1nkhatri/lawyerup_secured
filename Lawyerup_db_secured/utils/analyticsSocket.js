const { getAnalyticsData } = require('../controllers/analyticsController');

exports.analyticsSocketHandler = (socket) => {
  console.log('📊 Analytics client connected:', socket.id);

  const sendAnalytics = async () => {
    const fakeReq = {};
    const fakeRes = {
      json: (data) => {
        socket.emit('analyticsUpdate', data);
      },
      status: () => ({ json: () => {} })
    };

    try {
      await getAnalyticsData(fakeReq, fakeRes);
    } catch (err) {
      console.error('❌ Analytics error:', err.message);
    }
  };

  sendAnalytics(); // initial emit
  const interval = setInterval(sendAnalytics, 60000); // every 1 min

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('❌ Analytics socket disconnected');
  });
};
