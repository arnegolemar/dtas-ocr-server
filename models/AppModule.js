const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const AppModule = new Schema({
  appModuleID: {type: String},

  name: {type: String},
  description: {type: String},

  moduleType: {type: String}, //main, sub, helper

  schemas: [{
    name: {type: String},
    fieldName: {type: String},
    description: {type: String},
    type: {type: String}, //String, Date, Boolean, Number
    defaultValue: {type: String},
  }],

  isGenerated: {type: Boolean, default: false},  
  addedAt: {type: Date, default: Date.now},
  createdAt: {type: Date, default: Date.now},
});

module.exports = mongoose.model('appModule', AppModule);
