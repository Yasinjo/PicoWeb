const mongoose = require('mongoose');
const { preSave, comparePassword } = require('../helpers/schemasHelper');

const { Schema } = mongoose;

const CitizenSchema = new Schema({
  phone_number: {
    type: Schema.Types.String,
    required: true,
    unique: true
  },
  full_name: {
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
  },
  active: {
    type: Schema.Types.Boolean,
    default: true
  },
  password: {
    type: Schema.Types.String,
    required: true
  }
});

CitizenSchema.pre('save', preSave);

CitizenSchema.methods.comparePassword = comparePassword;

CitizenSchema.methods.isActive = function isActive() {
  return this.active;
};

const CitizenModel = mongoose.model('Citizen', CitizenSchema);
CitizenModel.createIndexes();

module.exports = CitizenModel;
