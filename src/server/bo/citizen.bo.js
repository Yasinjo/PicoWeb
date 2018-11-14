const mongoose = require('mongoose');
const { preSave, comparePassword } = require('../helpers/schemasHelper');

const { Schema } = mongoose;

const CitizenSchema = new Schema({
  phone_number: {
    type: String,
    required: true,
    unique: true
  },
  full_name: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

CitizenSchema.pre('save', preSave);

CitizenSchema.methods.comparePassword = comparePassword;

module.exports = mongoose.model('Citizen', CitizenSchema);
