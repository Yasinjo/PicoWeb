/*
  * @file-description : this file exports the router to use with /api/alarms/citizens/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');
const {
  checkAmbulanceAvailabilty, checkSocketID, reserveAmbulance, linkSocketToAmbulancePosition,
  AMBULANCE_NOT_FOUND
} = require('../helpers/index');

const { CITIZEN_AUTH_STRATEGY_NAME } = require('../../citizens/index');

// Create the router
const router = express.Router();

/*
    * @route : POST /api/alarms/citizens
    * @description : declare an alarm
    * @Request body :
      {
          ambulance_id : <string>{required},
          socket_id : <string>{required}
      }

    * @Response body :
      - 400 : [ambulance not found, ambulance is no longer available]
        { success : <boolean>, msg : <string> }
      - 401 : [wrong token, wrong socket ID]
        { success : <boolean>, msg : <string> }
      - 201 :
        { success : <boolean> }
*/

router.post('/', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => {
    let socket = null;
    checkAmbulanceAvailabilty(request, response)
      .then(() => checkSocketID(request, response))
      .then((socketParam, citizenId) => {
        socket = socketParam;
        return reserveAmbulance(request.body.ambulance_id, citizenId);
      })
      .then(() => linkSocketToAmbulancePosition(socket, request.body.ambulance_id))
      .then(() => response.status(201).send({ success: true }))
      .catch(err => response.status(400).send({ success: false, msg: AMBULANCE_NOT_FOUND, err }));
  });

module.exports = {
  router
};
