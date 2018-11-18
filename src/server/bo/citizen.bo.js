/*
  * @file-description : this file exports the citizen Schema
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const mongoose = require('mongoose');
const { preSaveAccount, comparePassword } = require('../helpers/schemasHelper');

const { Schema } = mongoose;

// Create the Schema
const CitizenSchema = new Schema({
  phone_number: {
    type: Schema.Types.String,
    required: true,
    unique: true
  },
  full_name: {
    type: Schema.Types.String,
    required: true
  },
  latitude: {
    type: Schema.Types.Number,
    required: true
  },
  longitude: {
    type: Schema.Types.Number,
    required: true
  },
  active: {
    type: Schema.Types.Boolean,
    default: true
  },
  password: {
    type: Schema.Types.String,
    required: true
  }
});

// Add the Schema methods
CitizenSchema.pre('save', preSaveAccount);
CitizenSchema.methods.comparePassword = comparePassword;
CitizenSchema.methods.isActive = function isActive() {
  return this.active;
};

const CitizenModel = mongoose.model('Citizen', CitizenSchema);
// Create indexes for the mongoose model
CitizenModel.createIndexes();

// Export the module
module.exports = CitizenModel;
