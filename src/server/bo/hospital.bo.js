/*
  * @file-description : this file exports the hospital Schema
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create the Schema
const HospitalSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true
  },
  partner_id: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  latitude: {
    type: Schema.Types.Number,
    required: true
  },
  longitude: {
    type: Schema.Types.Number,
    required: true
  }
});

// Export the module
module.exports = mongoose.model('Hospital', HospitalSchema);
