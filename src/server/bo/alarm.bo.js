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
    type: Schema.Types.String,
    required: true
  },
  citizen_id: {
    type: Schema.Types.Boolean,
    required: true
  },
  date: {
    type: Schema.Types.Date,
    default: () => Date.now()
  },
  isFake: {
    type: Schema.Types.Boolean,
    default: false
  }
});

// Export the module
module.exports = mongoose.model('Alarm', AlarmSchema);
