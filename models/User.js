const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const User = new Schema({
  userID: { type: String },

  username: { type: String },

  name: {
    first: { type: String },
    mid: { type: String },
    last: { type: String },
    penName: { type: String },
  },

  address: {
    city: { type: String },
  },

  profilePictures: [{
    _id: false,
    path: { type: String },
    uploaded: { type: Date, default: Date.now },
    status: { type: String },
  }],

  dob: { type: Date },

  bio: { type: String },

  sex: { type: String },
  gender: { type: String },

  phone: {
    code: { type: String },
    number: { type: String },
    isVerified: { type: Boolean },
  },

  email: {
    name: { type: String },
    isVerified: { type: String },
  },

  auth: [{
    _id: false,
    type: { type: String },
    token: { type: String },
  }],

  account: [{
    name: { type: String },
    link: { type: String },
  }],

  verification: {
    proof: [{
      _id: false,
      name: { type: String },
      path: { type: String },
      verified: {
        status: { type: Boolean },
        date: { type: Date },
      },
      uploaded: { type: Date, default: Date.now },
    }],

    status: { type: Boolean },
    dateVerified: { type: Date },
  },

  dating: {
    preferences: { type: String },
    interests: [{
      _id: false,
      text: { type: String },
    }],
  },

  services: [{
    category: [{
      text: { type: String },
    }],
    name: { type: String },
    description: { type: String },
    rate: { type: Number },
    images: [{
      _id: false,
      path: { type: String },
      uploaded: { type: Date, default: Date.now },
    }],
    isActive: { type: Boolean },
    isArchive: { type: Boolean },
  }],

  rentals: [{
    category: [{
      text: { type: String },
    }],
    name: { type: String },
    description: { type: String },
    rate: { type: Number },
    images: [{
      path: { type: String },
      uploaded: { type: Date, default: Date.now },
    }],
    isActive: { type: Boolean },
    isArchive: { type: Boolean },
  }],

  paymentSetting: [{
    _id: false,
    type: { type: String },
    token: { type: String },
  }],

  updatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('users', User);
