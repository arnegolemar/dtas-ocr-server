const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Office = new Schema({
  officeID: {type: String},
	division: {type: String},
  section: {type: String},
  code: {type: String},
  createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('offices', Office);
