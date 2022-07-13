const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Notif = new Schema({

  source: { type: Schema.Types.ObjectId, ref: 'user' },
  receiver: { type: Schema.Types.ObjectId, ref: 'user' },
  receivers: [{
    _id: false,
    id: { type: Schema.Types.ObjectId, ref: 'user' }
  }],
  type: { type: String, default: "" },
  msg: { type: String, default: "" },
  status: { type: String, default: "" },

  job: { type: Schema.Types.ObjectId, ref: 'jobpost' },

  date: { type: Date, default: Date.now },
  createdAt: {type: Date, default: Date.now},
});

module.exports = mongoose.model('notifs', Notif);
