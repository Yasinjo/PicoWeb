const mongoose = require('mongoose');

const { Schema } = mongoose;

const HospitalSchema = new Schema({
  name: {
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
  }
});

module.exports = mongoose.model('Hospital', HospitalSchema);
