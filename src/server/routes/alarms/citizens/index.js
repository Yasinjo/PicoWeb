/*
  * @file-description : this file exports the router to use with /api/alarms/citizens/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');
const {
  checkAmbulanceAvailabilty, reserveAmbulance, linkCitizenToAmbulance,
  prepareAlarmDataResponse, AMBULANCE_NOT_FOUND
} = require('../helpers/index');
const getToken = require('../../../helpers/getToken');
const { extractUserIdFromToken } = require('../../../auth/tokenExtractors');
const { CITIZEN_AUTH_STRATEGY_NAME } = require('../../citizens/index');

// Create the router
const router = express.Router();

/*
    * @route : POST /api/alarms/citizens
    * @description : declare an alarm
    * @Request body :
      {
          ambulance_id : <string>{required}
      }

    * @Response body :
      - 400 : [ambulance not found, ambulance is no longer available]
        { success : <boolean>, msg : <string> }
      - 201 :
        {
          success : <boolean>,
          driver_id : <string>,
          driver_full_name : <string>,
          ambulance_registration_number : <string>,
          ambulance_longitude : <number>,
          ambulance_latitude : <number>
        }
*/

router.post('/', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => {
    let citizenId = null;
    let ambulance = null;
    console.log('New alarm :');
    console.log(request.body);
    checkAmbulanceAvailabilty(request, response)
      .then((ambulanceParam) => {
        console.log('1');
        ambulance = ambulanceParam;
        const token = getToken(request.headers);
        return extractUserIdFromToken(token);
      })
      .then((userId) => {
        console.log('2');
        citizenId = userId;
        return reserveAmbulance(request.body.ambulance_id, userId);
      })
      .then((alarm) => {
        console.log('3');
        linkCitizenToAmbulance(request.body.ambulance_id, citizenId, alarm._id).catch();
        return prepareAlarmDataResponse(citizenId, ambulance);
      })
      .then(responseParam => response.status(201).send({ success: true, ...responseParam }))
      .catch((err) => {
        console.log('Router error :');
        console.log(err);
        response.status(400).send({ success: false, msg: AMBULANCE_NOT_FOUND });
      });
  });

module.exports = {
  router
};
