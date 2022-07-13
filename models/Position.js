const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Position = new Schema({
  name: {type: String},
  createdAt: {type: Date, default: Date.now},
});

module.exports = mongoose.model('positions', Position);
