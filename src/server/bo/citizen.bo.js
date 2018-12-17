/*
  * @file-description : this file exports the citizen Schema
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create the Schema
const CitizenSchema = new Schema({
  full_name: {
    type: Schema.Types.String,
    required: true
  },
  active: {
    type: Schema.Types.Boolean,
    default: true
  },
  phone_account_id: {
    type: Schema.Types.ObjectId,
    ref: 'Phone_account',
    required: true
  }
});

// Add the Schema methods
CitizenSchema.methods.isActive = function isActive() {
  return this.active;
};

const CitizenModel = mongoose.model('Citizen', CitizenSchema);
// Create indexes for the mongoose model
CitizenModel.createIndexes();

// Export the module
module.exports = CitizenModel;
