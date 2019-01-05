/*
  * @file-description : this file exports the router to use with /api/partners/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');

const Partner = require('../../bo/partner.bo');
const verifyRequiredFields = require('../../helpers/verifyRequiredFields');
const savePartner = require('./helpers/savePartner');
const signinPartner = require('./helpers/signinPartner');
const addAuthStrategy = require('../../auth/addAuthStrategy');

const PARTNER_AUTH_STRATEGY_NAME = 'Partner-auth-strategy';

// Create the router
const router = express.Router();

// Add the driver authentication strategy to the passport module
addAuthStrategy(passport, Partner, PARTNER_AUTH_STRATEGY_NAME, false);


/*
    * @route : POST /api/partners
    * @description : add a partner
    * @Request body :
      {
        organization_name : <string>{required},
        login : <string>{required},
        password : <string>{required},
      }
    * @Response body :
      - 400 :
        { success : <boolean>, msg : <string> }
      - 201 :
        { success : <boolean> }
*/
router.post('/', (request, response) => {
  // Initialize the required keys
  const requiredKeys = ['organization_name', 'login', 'password'];
  // Verify the required fields and save the partner
  verifyRequiredFields(request, response, requiredKeys)
    .then(() => {
      savePartner(request, response, requiredKeys);
    });
});

/*
    * @route : POST /api/partners/signin
    * @description : make a partner authentication
    * @Request body :
      {
          login : <string>{required},
          password : <string>{required},
      }
    * @Response body :
      - 401, 404 :
        { success : <boolean>, msg : <string> }
      - 200 :
        { success : <boolean>, token : <string> }
*/
router.post('/signin', (request, response) => {
  // Initialize the required keys
  const requiredKeys = ['login', 'password'];
  // Verify the required fields and pass to the authentication
  verifyRequiredFields(request, response, requiredKeys)
    .then(() => {
      signinPartner(request, response);
    });
});


/*
    * @route : POST /api/partners/validate_token
    * @description : validate a token
    * @Response status :
      - 401
      - 200
*/
router.post('/validate_token', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }), (request, response) => {
  response.status(200).json({ success: true });
});

module.exports = {
  router,
  PARTNER_AUTH_STRATEGY_NAME
};
