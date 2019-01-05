/*
  * @file-description : this file exports the router to use with /api/hospitals/partners/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');
const { getAllHospitalsByPartner } = require('../helpers/index');
const { PARTNER_AUTH_STRATEGY_NAME } = require('../../partners/index');

// Create the router
const router = express.Router();

/*
    * @route : GET /api/hospitals/partners
    * @description : get all the hospitals added by a partner
*/
router.get('/', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => getAllHospitalsByPartner(request, response));


// Export the module
module.exports = {
  router
};
