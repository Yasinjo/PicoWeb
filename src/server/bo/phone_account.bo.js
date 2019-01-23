/*
  * @file-description : this file exports the phone account Schema
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { preSaveAccount, comparePassword } = require('../helpers/schemasHelper');

const { Schema } = mongoose;
const CITIZEN_PHONE_ACCOUNT_TYPE = 'CITIZEN_PHONE_ACCOUNT_TYPE';
const DRIVER_PHONE_ACCOUNT_TYPE = 'DRIVER_PHONE_ACCOUNT_TYPE';

// Create the Schema
const PhoneAccountSchema = new Schema({
  phone_number: {
    type: Schema.Types.String,
    unique: true,
    required: true
  },
  password: {
    type: Schema.Types.String,
    required: true
  },
  latitude: {
    type: Schema.Types.Number,
    default: -7
  },
  longitude: {
    type: Schema.Types.Number,
    default: 33
  },
  socketId: {
    type: Schema.Types.String
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
PhoneAccountSchema.plugin(uniqueValidator);

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
