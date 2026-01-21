const moment = require('moment');

exports.getCurrentMonthKey = () => {
  const now = moment();
  return {
    month: now.format('MMMM'), 
    year: now.year()
  };
};
