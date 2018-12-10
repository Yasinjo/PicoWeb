/*
  * @file-description : this file exports the router to use with /api/alarms/citizens/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');
const { checkAmbulanceAvailabilty, checkSocketID } = require('../helpers/index');

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

router.get('/', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => {
    checkAmbulanceAvailabilty(request, response)
      .then(() => checkSocketID(request, response))
      .then((socket) => {
        reserveAmbulance(request, (err) => {
          if (!err) { linkSocketToAmbulancePosition(socket, request.body.ambulance_id); }
        });
      });
    // Check if the ambulance is available
    // Validate if the socket ID has the same citizen id as the request
    // Update the ambulance status
    // Subscribe the citizen to the ambulance position
    // Create an alarm object
  });
