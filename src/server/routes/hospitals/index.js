/*
  * @file-description : this file exports the router to use with /api/hospitals/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');

const GenericDAO = require('../../dao/genericDAO');
const Hospital = require('../../bo/hospital.bo');
const { CITIZEN_AUTH_STRATEGY_NAME } = require('../citizens/index');

// Create the router
const router = express.Router();

/*
    * @function
    * @description : get the an authorization token from the request headers
    * @param{headers}[Object] : the http request headers
    * @return{string} : The extracted token
*/
function getToken(headers) {
  // Check the headers for authorization token
  if (headers && headers.authorization) {
    /* Remember the token that we send in /api/citizens/signin hass the following structure
      '{token_type} {token}', so we need to extract jut the token part */
    const parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    }
    return null;
  }
  return null;
}

/*
    * @route : GET /api/hospitals
    * @description : get all the hospitals
    * @Request header :
        Authorization : <string>{required} ==> The token
    * @Response body :
      - 403
      - 500
      - 200 :
        { success : <boolean>,
          hospitals : [
            {
                _id : <string>
                name : <string>,
                latitude : <number>,
                longiude : <number>
            }
          ]
        }
*/
router.get('/', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }), (request, response) => {
  // Get the token from the request
  const token = getToken(request.headers);
  // Check the token
  if (token) {
    // If there is a token, fetch hospitals from database
    return GenericDAO.find(Hospital, {}, (err, hospitals) => {
      // If there is an error, send it in response
      if (err) response.status(500).send(err);
      // Otherwise, send the hospitals in response
      return response.status(200).send({ success: true, hospitals });
    });
  }
  // If there is no token, send a 403 response
  return response.status(403).send({ success: false });
});

// Export the module
module.exports = {
  router
};
