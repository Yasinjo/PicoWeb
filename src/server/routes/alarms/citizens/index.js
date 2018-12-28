/*
  * @file-description : this file exports the router to use with /api/alarms/citizens/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');
const {
  checkAmbulanceAvailabilty, createAlarm, notifyDriver,
  addCitizenInWaitingQueue, AMBULANCE_NOT_FOUND
} = require('../helpers/index');
const getToken = require('../../../helpers/getToken');
const GenericDAO = require('../../../dao/genericDAO');
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
          driver :
          {
            driver_id : <string>,
            driver_full_name : <string>,
            ambulance_registration_number : <string>,
            driver_longitude : <number>,
            driver_latitude : <number>
          }
        }
*/

router.post('/', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => {
    let citizenId = null;
    let ambulance = null;
    let alarm = null;
    checkAmbulanceAvailabilty(request, response)
      .then((ambulanceParam) => {
        console.log('1');
        ambulance = ambulanceParam;
        const token = getToken(request.headers);
        return extractUserIdFromToken(token);
      })
      .then((userId) => {
        citizenId = userId;
        console.log('2');
        return createAlarm(ambulance._id, userId);
      })
      .then((alarmParam) => {
        console.log('3');
        alarm = alarmParam;
        addCitizenInWaitingQueue(citizenId, ambulance._id)
          .catch((err) => {
            console.log('addCitizenInWaitingQueue error :');
            console.log(err);
          });

        return GenericDAO.findAmbulanceDriver(ambulance._id);
      })
      .then((driver) => {
        console.log('4');
        notifyDriver(driver._id, citizenId, alarm._id)
          .catch(err => console.log(`NotifyDriver error : ${err}`));
        response.status(201).send({ success: true, alarm_id: alarm._id });
      })
      .catch((err) => {
        console.log('Router error :');
        console.log(err);
        response.status(400).send({ success: false, msg: AMBULANCE_NOT_FOUND });
      });
  });

module.exports = {
  router
};
