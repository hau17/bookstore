const moment = require("moment");
const helpers = require("handlebars-helpers")();

module.exports = {
  eq: (a, b) => a == b,
  formatDate: (date) => moment(date).format("DD/MM/YYYY HH:mm:ss"),
  formatDateTime: (date) => moment(date).format("DD/MM/YYYY HH:mm:ss"),
  toUpperCase: (str) => (str || "").toUpperCase(),
  formatPrice: (value) => {
    try {
      const n = Number(value) || 0;
      return n.toLocaleString("vi-VN");
    } catch (e) {
      return value;
    }
  },
  multiply: (a, b) => {
    return (Number(a) || 0) * (Number(b) || 0);
  },
};
