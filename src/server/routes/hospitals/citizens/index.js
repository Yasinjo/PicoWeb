/*
  * @file-description : this file exports the router to use with /api/hospitals/citizens/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');
const { getAllHospitals, getAmbulancesByHospital } = require('../helpers/index');
const { CITIZEN_AUTH_STRATEGY_NAME } = require('../../citizens/index');

// Create the router
const router = express.Router();

/*
    * @route : GET /api/hospitals/citizens
    * @description : get all the hospitals
*/
router.get('/', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => getAllHospitals(request, response));

/*
    * @route : GET /api/hospitals/citizens/<hospital_id>/ambulances
    * @description : get ambulances that can pick us up to a specific hospital
*/
router.get('/:hospital_id/ambulances', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => getAmbulancesByHospital(request, response));


// Export the module
module.exports = {
  router
};
