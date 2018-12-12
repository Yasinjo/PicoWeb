/*
  * @file-description : this file exports the phone account Schema
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const mongoose = require('mongoose');
const { preSaveAccount, comparePassword } = require('../helpers/schemasHelper');

const { Schema } = mongoose;
const CITIZEN_PHONE_ACCOUNT_TYPE = 'CITIZEN_PHONE_ACCOUNT_TYPE';
const DRIVER_PHONE_ACCOUNT_TYPE = 'DRIVER_PHONE_ACCOUNT_TYPE';

// Create the Schema
const PhoneAccountSchema = new Schema({
  phone_number: {
    type: Schema.Types.String,
    required: true,
    unique: true
  },
  password: {
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
  type: {
    type: Schema.Types.String,
    enum: [CITIZEN_PHONE_ACCOUNT_TYPE, DRIVER_PHONE_ACCOUNT_TYPE],
    required: true
  }
});

// Add the Schema methods
PhoneAccountSchema.pre('save', preSaveAccount);
PhoneAccountSchema.methods.comparePassword = comparePassword;

const PhoneAccountModel = mongoose.model('Phone_account', PhoneAccountSchema);
// Create indexes for the mongoose model
PhoneAccountModel.createIndexes();

// Export the module
module.exports = PhoneAccountModel;
module.exports = {
  CITIZEN_PHONE_ACCOUNT_TYPE,
  DRIVER_PHONE_ACCOUNT_TYPE,
  PhoneAccount: PhoneAccountModel
};
