const moment = require('moment');

module.exports = {
  eq: (a, b) => a == b,
  formatDate: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss'),
  toUpperCase: (str) => (str || '').toUpperCase()
};
