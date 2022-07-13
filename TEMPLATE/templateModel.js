const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Temp1 = new Schema({
  temp3ID: {type: String},

  createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('temp3s', Temp1);
