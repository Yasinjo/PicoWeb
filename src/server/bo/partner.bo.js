
/*
  * @file-description : this file exports the partner Schema
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { preSaveAccount, comparePassword } = require('../helpers/schemasHelper');

const { Schema } = mongoose;

// Create the Schema
const PartnerSchema = new Schema({
  organization_name: {
    type: Schema.Types.String,
    required: true
  },
  login: {
    type: Schema.Types.String,
    required: true,
    unique: true
  },
  password: {
    type: Schema.Types.String,
    required: true
  }
});

PartnerSchema.pre('save', preSaveAccount);
PartnerSchema.methods.comparePassword = comparePassword;
PartnerSchema.plugin(uniqueValidator);
// Export the module
module.exports = mongoose.model('Partner', PartnerSchema);
