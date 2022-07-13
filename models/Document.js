const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Document = new Schema({
	documentID: { type: String },
	owner: { type: Schema.Types.ObjectId, ref: 'students', default: null },
	ownerOffice: { type: Schema.Types.ObjectId, ref: 'offices', default: null },
	type: { type: String },//profile pic, pds, etc.
	status: { type: String },//current, deleted, previous
	dateUploaded: { type: Date },
	name: { type: String },
	path: { type: String },

	currentAction: {
		status: { type: String }, //received, incoming
		remarks: { type: String },
		office: { type: Schema.Types.ObjectId, ref: 'offices', default: null },
		officeFrom: { type: Schema.Types.ObjectId, ref: 'offices', default: null },
		receivedBy: { type: Schema.Types.ObjectId, ref: 'users', default: null },
		movedBy: { type: Schema.Types.ObjectId, ref: 'users', default: null },
		date: { type: Date, default: Date.now },
	},

	actions: [{
		_id: false,
		status: { type: String }, //received, incoming
		remarks: { type: String },
		office: { type: Schema.Types.ObjectId, ref: 'offices', default: null },
		officeFrom: { type: Schema.Types.ObjectId, ref: 'offices', default: null },
		receivedBy: { type: Schema.Types.ObjectId, ref: 'users', default: null },
		movedBy: { type: Schema.Types.ObjectId, ref: 'users', default: null },
		date: { type: Date, default: Date.now },
		seen: { type: Boolean, default: false },
	}],

	context: {
		date: { type: Date },
		sem: { type: String },
		ay: { type: String },
		course: {
			code: { type: String },
			title: { type: String },
		},
		student: {
			fname: { type: String },
			lname: { type: String },
			id: { type: String },
			yr: { type: String },
			as: { type: String }, //academic standing
			prog: { type: String },
		},
		grade: { type: String },
		faculty: { type: String },
		units: {
			earned: { type: String },
			approved: { type: String },
		},

		facEquip: { type: String },
		college: { type: String },
		dept: { type: String },
	},

	tags: { type: String },

	content: { type: String },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('documents', Document);
