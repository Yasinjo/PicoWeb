/*
  * @file-description : this file exports the router to use with /api/hospitals/drivers/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');
const { getAllHospitalsByDriver } = require('../helpers/index');
const { DRIVER_AUTH_STRATEGY_NAME } = require('../../drivers/index');

// Create the router
const router = express.Router();

/*
    * @route : GET /api/hospitals/drivers
    * @description : get all the hospitals that the driver can deliver citizens to
*/
router.get('/', passport.authenticate(DRIVER_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => getAllHospitalsByDriver(request, response));


// Export the module
module.exports = {
  router
};
