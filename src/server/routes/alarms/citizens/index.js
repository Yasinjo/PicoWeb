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
          ambulance_id : <string>{required}
      }

    * @Response body :
      - 400 : [ambulance not found, ambulance is no longer available]
        { success : <boolean>, msg : <string> }
      - 201 :
        { 
          success : <boolean>,
          driver_full_name : <string>,
          ambulance_matricule : <string>,
          ambulance_longitude : <number>,
          ambulance_latitude : <number>
        }
*/

router.post('/', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => {
    let socketVar = null;
    checkAmbulanceAvailabilty(request, response)
      .then(() => {
        console.log('1');
        return checkSocketID(request, response);
      })
      .then(({ socket, userId }) => {
        socketVar = socket;
        return reserveAmbulance(request.body.ambulance_id, userId);
      })
      .then((citizenId) => {
        console.log('3');
        return linkSocketToAmbulancePosition(socketVar, request.body.ambulance_id, citizenId);
      })
      .then(() => response.status(201).send({ success: true }))
      .catch((err) => {
        response.status(400).send({ success: false, msg: AMBULANCE_NOT_FOUND });
      });
  });

module.exports = {
  router
};
