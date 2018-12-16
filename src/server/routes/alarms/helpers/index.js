const GenericDAO = require('../../../dao/genericDAO');
const Ambulance = require('../../../bo/ambulance.bo');
const Alarm = require('../../../bo/alarm.bo');
const Driver = require('../../../bo/driver.bo');
const Citizen = require('../../../bo/citizen.bo');
const getToken = require('../../../helpers/getToken');
const { matchSocketToToken, NEW_ALARM_EVENT } = require('../../../web-sockets/index');
const { findPhoneAccountFromUserId } = require('../../../helpers/phoneAccountHelpers');

const AMBULANCE_NOT_FOUND = 'Ambulance not found';
const AMBULANCE_NOT_AVAILABLE = 'Ambulance not available anymore';

const SOCKET_ERROR = 'Wrong socket ID';

const positionRoomNameFromDriver = driverId => `/drivers/${driverId}/position_update`;

const ambulancePositionRoomName = ambulanceId => new Promise((resolve, reject) => {
  GenericDAO.findOne(Driver, { ambulance_id: ambulanceId }, (err, driver) => {
    if (err || !driver) return reject(err);
    return resolve(positionRoomNameFromDriver(driver._id));
  });
});

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

        return resolve();
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
    GenericDAO.updateFields(Ambulance, { _id: ambulanceId }, { available: false }, (err) => {
      if (err) return reject(err);
      const alarm = new Alarm({ ambulance_id: ambulanceId, citizen_id: citizenId });
      return GenericDAO.save(alarm).then(() => resolve(citizenId)).catch((err) => reject(err));
    });
  });
}

function notifyDriver(socket, roomName, citizenId) {
  findPhoneAccountFromUserId(Citizen, citizenId)
    .then(({ businessObject, phoneAccount }) => {
      const msg = {
        citizen_id: citizenId,
        full_name: businessObject.full_name,
        longitude: phoneAccount.longitude,
        latitude: phoneAccount.latitude
      };

      socket.to(roomName)
        .emit(NEW_ALARM_EVENT, msg);
    }).catch((err) => {
      console.log('notifyDriver error : ');
      console.log(err);
    });
}

function linkSocketToAmbulancePosition(socket, ambulanceId, citizenId) {
  return new Promise((resolve, reject) => {
    ambulancePositionRoomName(ambulanceId)
      .then((roomName) => {
        socket.join(roomName);
        notifyDriver(socket, roomName, citizenId);
        resolve();
      }).catch(reject);
  });
}

module.exports = {
  checkAmbulanceAvailabilty,
  reserveAmbulance,
  linkSocketToAmbulancePosition,
  positionRoomNameFromDriver,
  AMBULANCE_NOT_FOUND
};
