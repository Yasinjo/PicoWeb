const _ = require('lodash');
const verifyRequiredFields = require('./verifyRequiredFields');
const { savePhoneAccount, findPhoneAccountFromUserId } = require('./phoneAccountHelpers');
const { uploadPictureHelper } = require('./uploadPictureHelper');
const { PhoneAccount } = require('../bo/phone_account.bo');
const GenericDAO = require('../dao/genericDAO');
const createToken = require('../auth/createToken');
const getToken = require('./getToken');
const { extractUserIdFromToken } = require('../auth/tokenExtractors');
// Initialize constants
const PHONE_DUPLICATION_ERROR = 'Phone number already used';
const USER_NOT_FOUND = 'Authentication failed, user not found.';
const WRONG_PASSWORD = 'Authentication failed. Wrong password.';

function saveUser(request, response, accountType, dataKeys, BOSchema, uploadsRepoName) {
  // Save a phone_account from request
  return savePhoneAccount(request.body, accountType).then((phoneAccount) => {
    // Create a user business object from the request body
    const userData = _.pick(request.body, dataKeys);
    console.log('userData');
    console.log(userData);
    userData.phone_account_id = phoneAccount._id;

    const user = new BOSchema(userData);
    // Save the user to the database
    GenericDAO.save(user)
      .then(() => {
        // Upload the image file (if there is an image), and send the response
        if (request.file && request.file.buffer) {
          uploadPictureHelper(request.file.buffer, user._id, uploadsRepoName,
            () => response.status(201).json({ success: true }));
        } else { response.status(201).json({ success: true }); }
      })
      .catch((err) => {
        response.status(400).json({ success: false, error: err });
      });
  }).catch((err) => {
    console.log('Error DAO save phone account :');
    console.log(err);
    response.status(405).json({ success: false, error: PHONE_DUPLICATION_ERROR });
  });
}

/*
    * @function
    * @description : validate the user authentication using phone number and a password
    * @param{requestBody}[Object] : the http request body
    * @param{accountType}[String] : the account type to check
      ('CITIZEN_PHONE_ACCOUNT_TYPE', 'DRIVER_PHONE_ACCOUNT_TYPE')
    * @param{verifyAccountActivation}[function] #optional : a function to verify account activation,
     it should accept 3 params :
        @param{resolve}[function] : the function to call if the account is active
        @param{resolve}[function] :
        @param{resolve}[function] :
    * @return{Promise} : The promise will indicate the authentication status
*/
function validateUserAuth(BOSchema, requestBody, accountType, verifyAccountActivation) {
  // Create and return the promise
  return new Promise((resolve, reject) => {
    // Check the request body for the required fields
    if (!requestBody.phone_number || !requestBody.password) { return reject({ status: 400 }); }

    // Search the user in the database
    return GenericDAO.findOne(PhoneAccount, { phone_number: requestBody.phone_number },
      (err, phoneAccount) => {
        // if there is an error or the user isn't found, then send a promise rejection
        if (err || !phoneAccount || phoneAccount.type !== accountType) {
          return reject({ msg: USER_NOT_FOUND, status: 400 });
        }
        // Otherwise, check the password
        return phoneAccount.comparePassword(requestBody.password, (errComp, isMatch) => {
          // If the password is correct, check the account activation
          if (!errComp && isMatch) {
            // Find the citizen object
            return GenericDAO.findOne(BOSchema, { phone_account_id: phoneAccount._id },
              (error, bo) => {
                if (error || !bo) {
                  return reject({ msg: USER_NOT_FOUND, status: 400 });
                }

                if (verifyAccountActivation) {
                  return verifyAccountActivation(resolve, reject, bo);
                }

                return resolve(bo);
              });
          }
          // Otherwise, send a promise rejection
          return reject({ msg: WRONG_PASSWORD, status: 400 });
        });
      });
  });
}


function signupUser(request, response, requiredKeys, dataKeys,
  accountType, BOSchema, uploadsRepoName) {
  // Check if the request body contains all the required fields
  verifyRequiredFields(request, response, requiredKeys)
    .then(() => saveUser(request, response, accountType, dataKeys, BOSchema, uploadsRepoName));
}


function signinUser(BOSchema, request, response, accountType, verifyAccountActivation) {
  // Validate the user authentication
  validateUserAuth(BOSchema, request.body, accountType, verifyAccountActivation)
    .then((user) => {
      // If everything is correct, create a token
      const token = createToken(user._id);
      // Send the token in the response
      response.status(200).send({ success: true, token });
    }).catch(({ msg, status }) => {
      // If there is an error, send it in the response
      response.status(status).send({ success: false, msg });
    });
}

function retreiveUserData(request, response, BOSchema, dataKeys) {
  const token = getToken(request.headers);
  extractUserIdFromToken(token)
    .then((userId) => {
      GenericDAO.findOne(BOSchema, { _id: userId }, (err, user) => {
        if (err || !user) response.status(400).send(err);
        const obj = _.pick(user, dataKeys);
        response.status(200).send(obj);
      });
    });
}

function changeUserPassword(request, response, BOSchema) {
  verifyRequiredFields(request, response, ['password'])
    .then(() => {
      const token = getToken(request.headers);
      extractUserIdFromToken(token)
        .then(userId => findPhoneAccountFromUserId(BOSchema, userId))
        .then(({ phoneAccount }) => {
          GenericDAO.updateFields(PhoneAccount, { _id: phoneAccount._id },
            { password: request.body.password }, (err) => {
              console.log('Error :');
              console.log(err);
              if (err) return response.status(500).send(err);
              return response.status(200).send();
            });
        });
    });
}

function changeUserImage(request, response, uploadsRepoName) {
  if (request.file && request.file.buffer) {
    const token = getToken(request.headers);
    extractUserIdFromToken(token)
      .then((userId) => {
        uploadPictureHelper(request.file.buffer, userId, uploadsRepoName,
          () => response.status(200).json({ success: true }));
      });
  } else {
    response.status(400).send({
      success: false,
      msg: 'Please provide all the required data.'
    });
  }
}

module.exports = {
  signupUser,
  signinUser,
  changeUserPassword,
  retreiveUserData,
  changeUserImage
};
