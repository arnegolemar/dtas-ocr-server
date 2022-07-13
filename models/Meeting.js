const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Meeting = new Schema({

  meetingID : {type: String},
  agenda : {type: String},
  date : {type: Date},
  time : {type: String},
  participants : [
    {
      _id: false,
      id: {type: Schema.Types.ObjectId, ref: 'users'}
    }    
  ],
  minutes : {type: String},
  createdAt: {type: Date, default: Date.now},

});
module.exports = mongoose.model('meeting', Meeting);