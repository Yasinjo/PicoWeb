const express = require('express');
const _ = require('lodash');
const verifyRequuiredFields = require('../../helpers/verifyRequuiredFields');
const GenericDAO = require('../../dao/genericDAO');
const Citizen = require('../../bo/citizen.bo');

const SUCCESS_CREATION_MESSAGE = 'Successfully created new citizen.';

const router = express.Router();

router.post('/signup', (request, response) => {
  const requiredKeys = ['full_name', 'latitude', 'longitude', 'phone_number', 'password'];

  verifyRequuiredFields(request, response, requiredKeys).then(() => {
    const citizen = new Citizen(_.pick(request.body, requiredKeys));
    GenericDAO.save(citizen).then(() => {
      response.status(201).json({ success: true, msg: SUCCESS_CREATION_MESSAGE });
    }).catch(err => response.status(400).json({ success: false, msg: err }));
  });
});

module.exports = router;
