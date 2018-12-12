/*
  * @file-description : this file exports the router to use with /api/citizens/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const authConfig = require('../../../../config/auth.json');
const verifyRequiredFields = require('../../helpers/verifyRequiredFields');
const GenericDAO = require('../../dao/genericDAO');
const Citizen = require('../../bo/citizen.bo');
const { PhoneAccount, CITIZEN_PHONE_ACCOUNT_TYPE } = require('../../bo/phone_account.bo');
const { uploadPictureHelper, uploadMiddleware } = require('../../helpers/uploadPictureHelper');
const { savePhoneAccount } = require('../../helpers/phoneAccountHelpers');
const addAuthStrategy = require('../../auth/addAuthStrategy');

// Initialize constants
const PHONE_DUPLICATION_ERROR = 'Phone number already used';
const CITIZEN_NOT_FOUND = 'Authentication failed. citizen not found.';
const DEACTIVATED_ACCOUNT = 'Your account has been disabled because of a false alarm.';
const WRONG_PASSWORD = 'Authentication failed. Wrong password.';
const CITIZEN_AUTH_STRATEGY_NAME = 'Citizen-auth-strategy';

const CITIZENS_REPO_NAME = 'CITIZENS_REPO_NAME';

// Create the router
const router = express.Router();

// Add the citizen authentication strategy to the passport module
addAuthStrategy(passport, Citizen, CITIZEN_AUTH_STRATEGY_NAME);


function verifyAccountActivation(resolve, reject, phoneAccount) {
  // Find the citizen object
  GenericDAO.findOne(Citizen, { phone_account_id: phoneAccount._id }, (err, citizen) => {
    if (err || !citizen) {
      return reject({ msg: CITIZEN_NOT_FOUND, status: 400 });
    }
    // If the account is active, then resolve the promise
    if (citizen.isActive()) return resolve(citizen);
    // Otherwise, reject it
    return reject({ msg: DEACTIVATED_ACCOUNT, status: 403 });
  });
}

/*
    * @function
    * @description : validate the citizen authentication using phone number and a password
    * @param{requestBody}[Object] : the http request body
    * @return{Promise} : The promise will indicate the authentication status
*/
function validateCitizenAuth(requestBody) {
  // Create and return the promise
  return new Promise((resolve, reject) => {
    // Check the request body for the required fields
    if (!requestBody.phone_number || !requestBody.password) { return reject({ status: 400 }); }

    // Search the citizen in the database
    return GenericDAO.findOne(PhoneAccount, { phone_number: requestBody.phone_number },
      (err, phoneAccount) => {
        // if there is an error or the citizen isn't found, then send a promise rejection
        if (err || !phoneAccount || phoneAccount.type !== CITIZEN_PHONE_ACCOUNT_TYPE) {
          return reject({ msg: CITIZEN_NOT_FOUND, status: 400 });
        }
        // Otherwise, check the password
        return phoneAccount.comparePassword(requestBody.password, (errComp, isMatch) => {
          // If the password is correct, check the account activation
          if (!errComp && isMatch) {
            return verifyAccountActivation(resolve, reject, phoneAccount);
          }
          // Otherwise, send a promise rejection
          return reject({ msg: WRONG_PASSWORD, status: 400 });
        });
      });
  });
}

function saveUser(request, response) {
  // Save a phone_account from request
  savePhoneAccount(request.body, CITIZEN_PHONE_ACCOUNT_TYPE).then((phoneAccount) => {
    // Create a citizen business object from the request body
    const userData = { full_name: request.body.full_name, phone_account_id: phoneAccount._id };
    const citizen = new Citizen(userData);
    // Save the citizen to the database
    GenericDAO.save(citizen)
      .then(() => {
        // Upload the image file (if there is an image), and send the response
        if (request.file && request.file.buffer) {
          uploadPictureHelper(request.file.buffer, citizen._id, CITIZENS_REPO_NAME,
            () => response.status(201).json({ success: true }));
        } else { response.status(201).json({ success: true }); }
      })
      .catch((err) => {
        response.status(400).json({ success: false, error: err });
      });
  }).catch(() => response.status(405).json({ success: false, error: PHONE_DUPLICATION_ERROR }));
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
  // Check if the request body contains all the required fields
  verifyRequiredFields(request, response, requiredKeys).then(() => saveUser(request, response));
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
router.post('/signin', (req, res) => {
  // Validate the citizen authentication
  validateCitizenAuth(req.body)
    .then((citizen) => {
      // If everything is correct, create a token
      const token = jwt.sign({ _id: citizen._id }, authConfig.secret);
      // Send the token in the response
      res.status(200).send({ success: true, token: `JWT ${token}` });
    }).catch(({ msg, status }) => {
      // If there is an error, send it in the response
      res.status(status).send({ success: false, msg });
    });
});

// Export the module
module.exports = {
  CITIZEN_AUTH_STRATEGY_NAME,
  router
};
