const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Log = new Schema({
	commentID: { type: String },
	commentType: { type: Number, default: 1 }, // 1 Suggestion, 2 Data Error, 3 Functionality Issues
	user: { type: Schema.Types.ObjectId, ref: 'users' },
	location: { type: String },
	comment: { type: String },
	resolved: { type: Number, default: 0 },
	replies: [
		{
			_id: false,
			msg: { type: String, default: "" },
			user: { type: Schema.Types.ObjectId, ref: 'users' },
			date: { type: Date },
		}
	],

	viewed: { type: Number, default: 0 },
	date: { type: Date, default: Date.now },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('userComments', Log);
