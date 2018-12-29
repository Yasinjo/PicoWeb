const socketIO = require('socket.io');
const _ = require('lodash');

const Alarm = require('../bo/alarm.bo');
const Driver = require('../bo/driver.bo');
const Citizen = require('../bo/citizen.bo');
const Ambulance = require('../bo/ambulance.bo');

const GenericDAO = require('../dao/genericDAO');
const { extractUserIdFromToken } = require('../auth/tokenExtractors');
const { PhoneAccount } = require('../bo/phone_account.bo');
const { socketConnectionHandler } = require('./global');
const { findPhoneAccountFromUserId } = require('../helpers/phoneAccountHelpers');
const {
  DRIVER_SOCKET_TYPE, CITIZEN_SOCKET_TYPE, POSITION_CHANGE_EVENT, AMBULANCE_POSITION_CHANGE_EVENT,
  CITIZEN_POSITION_CHANGE_EVENT, SOCKET_NOT_FOUND, ALARM_NOT_FOUND_EVENT,
  UNAUTHORIZED_MISSION_COMPLETION_EVENT
} = require('./constants/index');

let io = null;

const getSocketById = socketId => io.sockets.connected[socketId];

const positionChangeRoomName = (socketType, userId) => {
  const root = (socketType === DRIVER_SOCKET_TYPE) ? 'drivers' : 'citizens';
  return `/${root}/${userId}/position_change`;
};

const ambulanceWaitingQueueRoomName = ambulanceId => `/ambulances/${ambulanceId}/waiting_queue`;


function changeAmbulanceAvailablity(ambulanceId, availability) {
  GenericDAO.updateFields(Ambulance, { _id: ambulanceId }, { available: availability }, (err) => {
    if (err) {
      console.log('changeAmbulanceAvailablity error :');
      console.log(err);
    }
  });
}

function updateSocket(user, socket) {
  return new Promise((resolve, reject) => {
    GenericDAO.updateFields(PhoneAccount, { _id: user.phone_account_id }, { socketId: socket.id },
      (err) => {
        if (err) return reject(err);
        return resolve();
      });
  });
}

function isSocketAuth(socket) {
  return socket.auth;
}

function setSocketAuth(socket, auth) {
  socket.auth = auth;
}


function socketAuth(socket, AuthenticationEventName,
  BOSchema, SuccessfullAuthEventName, socketType) {
  setSocketAuth(socket, false);
  socket.on(AuthenticationEventName, (data) => {
    if (data.token) {
      extractUserIdFromToken(data.token)
        .then((userId) => {
          GenericDAO.findOne(BOSchema, { _id: userId }, (err, user) => {
            if (err || !user) return;
            setSocketAuth(socket, true);
            socket.userId = userId;
            socket.socketType = socketType;
            updateSocket(user, socket)
              .then(() => socket.emit(SuccessfullAuthEventName, { success: true }))
              .catch((error) => {
                console.log('updateSocket error :');
                console.log(error);
              });
          });
        // Android communication
        }).catch((err) => {
          console.log('socketAuth error');
          console.log(err);
        });
    }
  });
}

function socketPositionChange(socket, BOSchema) {
  socket.on(POSITION_CHANGE_EVENT, (data) => {
    const requiredKeys = ['longitude', 'latitude'];
    const requiredKeysTest = _.every(requiredKeys, _.partial(_.has, data));
    if (!isSocketAuth(socket) || !requiredKeysTest
        || _.isNaN(data.longitude) || _.isNaN(data.latitude)) {
      return;
    }

    const msg = { ...data, sender_id: socket.userId };

    const eventName = (socket.socketType === DRIVER_SOCKET_TYPE)
      ? AMBULANCE_POSITION_CHANGE_EVENT : CITIZEN_POSITION_CHANGE_EVENT;


    socket.to(positionChangeRoomName(socket.socketType, socket.userId))
      .emit(eventName, msg);

    // Update position in the database
    GenericDAO.findOne(BOSchema, { _id: socket.userId }, (err, businessObject) => {
      if (err || !businessObject) {
        return;
      }

      GenericDAO.updateFields(PhoneAccount, { _id: businessObject.phone_account_id },
        { latitude: data.latitude, longitude: data.longitude }, (error) => {
          if (error) {
            console.log('socketPositionChange error :');
            console.log(error);
          }
        });
    });
  });
}

function socketDisconnect(socket, BOSchema) {
  socket.on('disconnect', () => {
    GenericDAO.findOne(BOSchema, { _id: socket.userId }, (err, businessObject) => {
      if (err || !businessObject) {
        return;
      }
      if (socket.ambulanceId) { changeAmbulanceAvailablity(socket.ambulanceId, true); }

      // send disconnetion to the other side

      GenericDAO.updateFields(PhoneAccount, { _id: businessObject.phone_account_id },
        { socketId: null }, (error) => {
          if (error) {
            console.log('socketDisconnect error :');
            console.log(error);
          }
        });
    });
  });
}

function getSocketByBOId(BusinessSchema, userId) {
  return new Promise((resolve, reject) => {
    findPhoneAccountFromUserId(BusinessSchema, userId)
      .then(({ phoneAccount }) => {
        const socket = getSocketById(phoneAccount.socketId);
        if (socket) { return resolve(socket); }
        return reject(SOCKET_NOT_FOUND);
      })
      .catch(err => reject(err));
  });
}

function joinRoom(BusinessSchema, userId, roomName, socketType) {
  return new Promise((resolve, reject) => {
    getSocketByBOId(BusinessSchema, userId)
      .then((socket) => {
        socket.join(roomName);
        resolve(socket);
      })
      .catch(err => reject({ socketType, err }));
  });
}

function initSocket(socket, AuthenticationEventName,
  BOSchema, SuccessfullAuthEventName, socketType) {
  socketAuth(socket, AuthenticationEventName,
    BOSchema, SuccessfullAuthEventName, socketType);

  socketPositionChange(socket, BOSchema);

  socketDisconnect(socket, BOSchema);
}

function init(server) {
  io = socketIO(server);

  io.on('connection', socketConnectionHandler);
}

// function matchSocketToToken(socketId, token) {
//   return new Promise((resolve, reject) => {
//     const socket = io.sockets.connected[socketId];
//     if (!socket) return reject();

//     return extractUserIdFromToken(token)
//       .then(userId => ((socket.userId === userId)
//         ? resolve({ socket, userId }) : reject(SOCKET_DATA_PROBLEM)));
//   });
// }

function sendMessageToBO(BusinessSchema, userId, eventName, message) {
  return new Promise((resolve, reject) => {
    getSocketByBOId(BusinessSchema, userId)
      .then((socket) => {
        socket.emit(eventName, message);
        resolve();
      })
      .catch(err => reject(err));
  });
}

function linkCitizenAndDriverSockets(citizenSocket, driverSocket, alarmId, ambulanceId) {
  citizenSocket.alarmId = alarmId;
  citizenSocket.ambulanceId = ambulanceId;

  driverSocket.alarmId = alarmId;
  driverSocket.ambulanceId = ambulanceId;

  driverSocket.join(positionChangeRoomName(CITIZEN_SOCKET_TYPE, citizenSocket.userId));
  citizenSocket.join(positionChangeRoomName(DRIVER_SOCKET_TYPE, driverSocket.userId));
}

function verifyDriverResponseToAlarmData(socket, data) {
  return new Promise((resolve) => {
    if (!data.alarm_id) return socket.emit(ALARM_NOT_FOUND_EVENT);

    return GenericDAO.findOne(Alarm, { _id: data.alarm_id }, (err, alarm) => {
      if (err || !alarm) return socket.emit(ALARM_NOT_FOUND_EVENT);

      return GenericDAO.findOne(Driver, { _id: socket.userId }, (err2, driver) => {
        if (err2 || !driver || !driver.ambulance_id
                || driver.ambulance_id.toString() !== alarm.ambulance_id.toString()) {
          return socket.emit(UNAUTHORIZED_MISSION_COMPLETION_EVENT);
        }

        return getSocketByBOId(Citizen, alarm.citizen_id)
          .then(citizenSocket => resolve({ citizenSocket, alarm }))
          .catch((err3) => {
            resolve({ alarm });
            console('verifyDriverResponseToAlarmData -> getSocketByBOId error :');
            console(err3);
          });
      });
    });
  });
}

function RemoveAmbulanceWaitingQueue(ambulanceId) {
  const roomName = ambulanceWaitingQueueRoomName(ambulanceId);
  io.sockets.clients(roomName).forEach((citizenSocket) => {
    citizenSocket.leave(roomName);
  });
}

module.exports = {
  sendMessageToBO,
  positionChangeRoomName,
  ambulanceWaitingQueueRoomName,
  linkCitizenAndDriverSockets,
  verifyDriverResponseToAlarmData,
  changeAmbulanceAvailablity,
  RemoveAmbulanceWaitingQueue,
  init,
  joinRoom,
  initSocket,
  setSocketAuth,
  isSocketAuth,
  getSocketByBOId,
  io
};
