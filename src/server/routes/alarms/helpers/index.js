const GenericDAO = require('../../../dao/genericDAO');
const Ambulance = require('../../../bo/ambulance.bo');
const Alarm = require('../../../bo/alarm.bo');
const Driver = require('../../../bo/driver.bo');
const Citizen = require('../../../bo/citizen.bo');
const { findPhoneAccountFromUserId } = require('../../../helpers/phoneAccountHelpers');
const {
  joinRoom, sendMessageToBO, positionChangeRoomName, DRIVER_SOCKET_TYPE, NEW_ALARM_EVENT
} = require('../../../web-sockets/index');

const AMBULANCE_NOT_FOUND = 'Ambulance not found';
const AMBULANCE_NOT_AVAILABLE = 'Ambulance not available anymore';

function checkAmbulanceAvailabilty(request, response) {
  return new Promise((resolve) => {
    GenericDAO.findOne(Ambulance, { _id: request.body.ambulance_id },
      (err, ambulance) => {
        if (err || !ambulance) {
          return response.status(400).send({ success: false, msg: AMBULANCE_NOT_FOUND });
        }
        if (!(ambulance.available)) {
          return response.status(400).send({ success: false, msg: AMBULANCE_NOT_AVAILABLE });
        }

        return resolve(ambulance);
      });
  });
}
/*
function checkSocketID(request, response) {
  return new Promise((resolve) => {
    const socketId = request.body.socket_id;
    const token = getToken(request.headers);

    matchSocketToToken(socketId, token)
      .then(({ socket, userId }) => {
        resolve({ socket, userId });
      })
      .catch((err) => {
        console.log('Error : ');
        console.log(err);
        response.status(401).send({ success: false, msg: SOCKET_ERROR });
      });
  });
}
*/

function reserveAmbulance(ambulanceId, citizenId) {
  return new Promise((resolve, reject) => {
    const alarm = new Alarm({ ambulance_id: ambulanceId, citizen_id: citizenId });
    GenericDAO.save(alarm).then(() => {
      GenericDAO.updateFields(Ambulance, { _id: ambulanceId }, { available: false }, (err) => {
        if (err) return reject(err);
        return resolve(alarm);
      });
    }).catch(error => reject(error));
  });
}

function notifyDriver(driverId, citizenId) {
  return new Promise((resolve, reject) => {
    findPhoneAccountFromUserId(Citizen, citizenId)
      .then(({ businessObject, phoneAccount }) => {
        const message = {
          citizen_id: citizenId,
          full_name: businessObject.full_name,
          longitude: phoneAccount.longitude,
          latitude: phoneAccount.latitude
        };

        return sendMessageToBO(Driver, driverId, NEW_ALARM_EVENT, message);
      })
      .then(() => resolve())
      .catch((err) => {
        console.log('NotifyDriver error : ');
        console.log(err);
        reject(err);
      });
  });
}

function linkCitizenToAmbulance(ambulanceId, citizenId) {
  return new Promise((resolve, reject) => {
    let driverId = null;
    GenericDAO.findAmbulanceDriver(ambulanceId)
      .then((driver) => {
        driverId = driver._id;
        return joinRoom(Citizen, citizenId, positionChangeRoomName(DRIVER_SOCKET_TYPE, driverId));
      })
      .then(() => {
        console.log('Notifying Driver');
        return notifyDriver(driverId, citizenId);
      })
      .then(() => {
        console.log('Resolving');
        resolve();
      })
      .catch(err => reject(err));
  });
}

/*
{
  driver_id : <string>,
  driver_full_name : <string>,
  ambulance_registration_number : <string>,
  ambulance_longitude : <number>,
  ambulance_latitude : <number>
}
*/
function prepareAlarmDataResponse(citizenId, ambulance) {
  return new Promise((resolve, reject) => {
    GenericDAO.findAmbulanceDriver(ambulance._id)
      .then(driver => findPhoneAccountFromUserId(Driver, driver._id))
      .then(({ businessObject, phoneAccount }) => {
        const response = {
          driver_id: businessObject._id,
          driver_full_name: businessObject.full_name,
          ambulance_registration_number: ambulance.registration_number,
          ambulance_longitude: phoneAccount.longitude,
          ambulance_latitude: phoneAccount.latitude
        };

        return resolve(response);
      })
      .catch(err => reject(err));
  });
}

module.exports = {
  checkAmbulanceAvailabilty,
  reserveAmbulance,
  linkCitizenToAmbulance,
  prepareAlarmDataResponse,
  AMBULANCE_NOT_FOUND
};
