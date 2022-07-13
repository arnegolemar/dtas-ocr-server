var moment = require('moment-timezone');

exports.getAsiaManila = (req, res) => {
  res.json({ status: true, date: moment().tz("Asia/Manila").format() });
}
