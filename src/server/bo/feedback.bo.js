/*
  * @file-description : this file exports the citizen feedback Schema
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create the Schema
const FeedbackSchema = new Schema({
  citizen_id: {
    type: Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true
  },
  driver_id: {
    type: Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  percentage: {
    type: Schema.Types.Number,
    required: true
  },
  comment: {
    type: Schema.Types.String
  },
  date: {
    type: Schema.Types.Date,
    default: () => Date.now()
  }
});

// Export the module
module.exports = mongoose.model('Feedback', FeedbackSchema);
