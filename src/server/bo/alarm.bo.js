/*
  * @file-description : this file exports the alarm Schema
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create the Schema
const AlarmSchema = new Schema({
  ambulance_id: {
    type: Schema.Types.ObjectId,
    ref: 'Ambulance',
    required: true
  },
  citizen_id: {
    type: Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true
  },
  date: {
    type: Schema.Types.Date,
    default: () => Date.now()
  },
  accepted: {
    type: Schema.Types.Boolean,
    default: false
  },
  isFake: {
    type: Schema.Types.Boolean,
    default: false
  },
  responsible_driver_id: {
    type: Schema.Types.ObjectId,
    ref: 'Driver'
  }
});

// Export the module
module.exports = mongoose.model('Alarm', AlarmSchema);
