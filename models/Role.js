const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Role = new Schema({
  name: {type: String},
	routes: [{type: String}],
  systems: [{type: String}],
  createdAt: {type: Date, default: Date.now},
});

module.exports = mongoose.model('roles', Role);
