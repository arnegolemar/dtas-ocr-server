const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Log = new Schema({
	message: {type: String},
	level:   {type: Number},
	functionality: {type: String},
	location: {type: String}, ///kung asa nag reside ang error sa code
	date: { type: Date, default: Date.now},
	resolved: {type: Number, default: 0},
	viewed: {type: Number, default: 0},
	comment: {type: String, default: ""}
});

module.exports = mongoose.model('logs', Log);
