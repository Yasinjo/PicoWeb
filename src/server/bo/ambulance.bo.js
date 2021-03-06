/*
  * @file-description : this file exports the ambulance Schema
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create the Schema
const AmbulanceSchema = new Schema({
  registration_number: {
    type: Schema.Types.String,
    required: true
  },
  available: {
    type: Schema.Types.Boolean,
    required: true,
    default: true
  },
  latitude: {
    type: Schema.Types.Number,
    default: -7
  },
  longitude: {
    type: Schema.Types.Number,
    default: 33
  },
  partner_id: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  hospital_ids: [{
    type: Schema.Types.ObjectId,
    ref: 'Hospital',
    default: []
  }]
});

// Export the module
module.exports = mongoose.model('Ambulance', AmbulanceSchema);
