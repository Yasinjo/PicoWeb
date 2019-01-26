/*
  * @file-description : this file exports the router to use with /api/citizens/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');
const path = require('path');

const Citizen = require('../../bo/citizen.bo');
const { CITIZEN_PHONE_ACCOUNT_TYPE } = require('../../bo/phone_account.bo');
const { uploadMiddleware, UPLOADS_PATH } = require('../../helpers/uploadPictureHelper');
const {
  signupUser, signinUser, retreiveUserData, changeUserPassword, changeUserImage
} = require('../../helpers/genericRoutesHelper');
const addAuthStrategy = require('../../auth/addAuthStrategy');

// Initialize constants
const DEACTIVATED_ACCOUNT = 'Your account has been disabled because of a false alarm.';
const CITIZEN_AUTH_STRATEGY_NAME = 'Citizen-auth-strategy';
const CITIZENS_REPO_NAME = 'CITIZENS_REPO_NAME';

// Create the router
const router = express.Router();

// Add the citizen authentication strategy to the passport module
addAuthStrategy(passport, Citizen, CITIZEN_AUTH_STRATEGY_NAME, true);


function verifyAccountActivation(resolve, reject, citizen) {
  // If the account is active, then resolve the promise
  if (citizen.isActive()) return resolve(citizen);
  // Otherwise, reject it
  return reject({ msg: DEACTIVATED_ACCOUNT, status: 403 });
}


/*
    * @route : POST /api/citizens/signup
    * @description : make a citizen subscription
    * @Request body :
      {
          full_name : <string>{required},
          latitude : <number>{required},
          longitude : <number>{required},
          phone_number : <string>{required},
          password : <string>{required},
          image : <image_file>{optional}, ==> see https://www.learn2crack.com/2014/08/android-upload-image-node-js-server.html
      }
    * @Response body :
      - 400 :
        { success : <boolean>, msg : <string> }
      - 201 :
        { success : <boolean> }
*/
router.post('/signup', uploadMiddleware.single('image'), (request, response) => {
  // Initialize the required keys
  const requiredKeys = ['phone_number', 'password', 'full_name', 'latitude', 'longitude'];
  // Call the generic function signupUser
  signupUser(request, response, requiredKeys, ['full_name'], CITIZEN_PHONE_ACCOUNT_TYPE, Citizen, CITIZENS_REPO_NAME);
});

/*
    * @route : POST /api/citizens/signin
    * @description : make a citizen authentication
    * @Request body :
      {
          phone_number : <string>{required},
          password : <string>{required},
      }
    * @Response body :
      - 400, 403 :
        { success : <boolean>, msg : <string> }
      - 200 :
        { success : <boolean>, token : <string> }
*/
router.post('/signin', (request, response) => {
  // Call the generic function signinUser
  signinUser(Citizen, request, response, CITIZEN_PHONE_ACCOUNT_TYPE, verifyAccountActivation);
});


/*
    * @route : GET /api/citizens/data
    * @description : get the name and the id of the connected citizen
    * @Request header :
        Authorization : token <String>
    * @Response body :
      - 400, 403 :
      - 200 :
        { id : <string>, full_name : <string> }
*/
router.get('/data', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }), (request, response) => {
  retreiveUserData(request, response, Citizen, ['full_name', '_id']);
});

/*
    * @route : PATCH /api/citizens/password
    * @description : change the citizen password
    * @Request body :
      {
          password : <string>{required}
      }
    * @Request header :
        Authorization : token <String>
    * @Response body :
      - 500, 403
      - 200
*/
router.patch('/password', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }), (request, response) => {
  changeUserPassword(request, response, Citizen);
});

/*
    * @route : PATCH /api/citizens/image
    * @description : change the citizen image
    * @Request body :
      {
          image : file
      }
    * @Request header :
        Authorization : token <String>
    * @Response body :
      - 400, 403, 500
      - 200
*/
router.patch('/image', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }), uploadMiddleware.single('image'),
  (request, response) => {
    changeUserImage(request, response, CITIZENS_REPO_NAME);
  });

// Image routing
router.use('/image', express.static(path.join(UPLOADS_PATH, CITIZENS_REPO_NAME)));

// Export the module
module.exports = {
  CITIZEN_AUTH_STRATEGY_NAME,
  CITIZENS_REPO_NAME,
  router
};
