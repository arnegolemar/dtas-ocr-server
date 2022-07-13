const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Student = new Schema({
  personalInfo: {
    name: {
      first: { type: String },
      mid: { type: String },
      last: { type: String },
      ext: { type: String },
    },
    sex: { type: String },
    dob: { type: Date },
    pob: { type: String },
    citizenship: { type: String },
    civilStatus: { type: String },
    homeAddress: {
      block: { type: String, default: "" },
      street: { type: String, default: "" },
      village: { type: String, default: "" },
      brgy: { type: String, default: "" },
      cm: { type: String, default: "" },
      province: { type: String, default: "" },
      zipcode: { type: String, default: "" },
    },

    father: {
      name: {
        first: { type: String },
        mid: { type: String },
        last: { type: String },
      }
    },
    mother: {
      name: {
        first: { type: String },
        mid: { type: String },
        last: { type: String },
      }
    },
  },
  files: [{
    type: { type: String },//profile pic, pds, etc.
    status: { type: String },//current, deleted, previous
    dateUploaded: { type: Date },
    name: { type: String },
    path: { type: String },
  }],

  studentID: { type: String },
  password: { type: String },

  profilePic: {
    path: { type: String },
    name: { type: String },
    dateUploaded: { type: Date, default: null },
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('students', Student);
