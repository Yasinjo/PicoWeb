/*
  * @file-description : this file exports the router to use with /api/partners/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');

const Partner = require('../../bo/partner.bo');
// const Ambulance = require('../../bo/ambulance.bo');
// const { DRIVER_PHONE_ACCOUNT_TYPE } = require('../../bo/phone_account.bo');
// const GenericDAO = require('../../dao/genericDAO');
// const verifyRequiredFields = require('../../helpers/verifyRequiredFields');
// const { uploadMiddleware, UPLOADS_PATH } = require('../../helpers/uploadPictureHelper');
// const { signupUser, signinUser } = require('../../helpers/genericRoutesHelper');
// const { AMBULANCE_NOT_FOUND } = require('../alarms/helpers/index');
const addAuthStrategy = require('../../auth/addAuthStrategy');

const PARTNER_AUTH_STRATEGY_NAME = 'Partner-auth-strategy';

// Create the router
const router = express.Router();

// Add the driver authentication strategy to the passport module
addAuthStrategy(passport, Partner, PARTNER_AUTH_STRATEGY_NAME, false);

/*
    * @route : POST /api/partners/validate_token
    * @description : validate a token
    * @Response status :
      - 401
      - 200
*/
router.post('/validate_token', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }), (request, response) => {
  response.status(200);
});

module.exports = {
  router
};
