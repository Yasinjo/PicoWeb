/*
  * @file-description : this file exports the driver Schema
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create the Schema
const DriverSchema = new Schema({
  full_name: {
    type: Schema.Types.String,
    required: true
  },
  ambulance_id: {
    type: Schema.Types.ObjectId,
    ref: 'Ambulance'
  },
  phone_account_id: {
    type: Schema.Types.ObjectId,
    ref: 'Phone_account',
    required: true
  }
});

// Export the module
module.exports = mongoose.model('Driver', DriverSchema);
