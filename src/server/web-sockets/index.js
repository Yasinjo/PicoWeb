const socketIO = require('socket.io');
const _ = require('lodash');
const { extractUserIdFromToken } = require('../auth/tokenExtractors');
const GenericDAO = require('../dao/genericDAO');
const Citizen = require('../bo/citizen.bo');
const Driver = require('../bo/driver.bo');
const { PhoneAccount } = require('../bo/phone_account.bo');
const { findPhoneAccountFromUserId } = require('../helpers/phoneAccountHelpers');

const CITIZEN_AUNTENTICATION_EVENT = 'CITIZEN_AUNTENTICATION_EVENT';
const CITIZEN_AUTH_SUCCESS_EVENT = 'CITIZEN_AUTH_SUCCESS_EVENT';
const DRIVER_AUNTENTICATION_EVENT = 'DRIVER_AUNTENTICATION_EVENT';
const DRIVER_AUTH_SUCCESS_EVENT = 'DRIVER_AUTH_SUCCESS_EVENT';
const NEW_ALARM_EVENT = 'NEW_ALARM_EVENT';
const POSITION_CHANGE_EVENT = 'POSITION_CHANGE_EVENT';
const CITIZEN_SOCKET_TYPE = 'CITIZEN_SOCKET_TYPE';
const DRIVER_SOCKET_TYPE = 'DRIVER_SOCKET_TYPE';

const SOCKET_NOT_FOUND = 'SOCKET_NOT_FOUND';

const AMBULANCE_POSITION_CHANGE_EVENT = 'AMBULANCE_POSITION_CHANGE_EVENT';
const CITIZEN_POSITION_CHANGE_EVENT = 'CITIZEN_POSITION_CHANGE_EVENT';

let io = null;

const getSocketById = socketId => io.sockets.connected[socketId];

const positionChangeRoomName = (socketType, userId) => {
  const root = (socketType === DRIVER_SOCKET_TYPE) ? 'drivers' : 'citizens';
  return `/${root}/${userId}/position_change`;
};

function updateSocket(user, socket) {
  return new Promise((resolve, reject) => {
    GenericDAO.updateFields(PhoneAccount, { _id: user.phone_account_id }, { socketId: socket.id },
      (err) => {
        if (err) return reject(err);
        return resolve();
      });
  });
}


function socketAuth(socket, AuthenticationEventName,
  BOSchema, SuccessfullAuthEventName, socketType) {
  socket.auth = false;
  socket.on(AuthenticationEventName, (data) => {
    extractUserIdFromToken(data.token)
      .then((userId) => {
        GenericDAO.findOne(BOSchema, { _id: userId }, (err, user) => {
          if (err || !user) return;
          socket.auth = true;
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
  });
}

function socketPositionChange(socket, BOSchema) {
  socket.on(POSITION_CHANGE_EVENT, (data) => {
    const requiredKeys = ['longitude', 'latitude'];
    const requiredKeysTest = _.every(requiredKeys, _.partial(_.has, data));
    if (!socket.auth || !requiredKeysTest || _.isNaN(data.longitude) || _.isNaN(data.latitude)) {
      return;
    }

    const msg = { ...data, sender_id: socket.userId };

    const eventName = (socket.socketType === DRIVER_SOCKET_TYPE)
      ? AMBULANCE_POSITION_CHANGE_EVENT : CITIZEN_POSITION_CHANGE_EVENT;

    socket.to(positionChangeRoomName(socket.socketType, socket.userId))
      .emit(eventName, msg);

    // Update position in the database
    GenericDAO.findOne(BOSchema, { id: socket.userId }, (err, businessObject) => {
      if (err || !businessObject) return;

      GenericDAO.updateFields(BOSchema, { _id: businessObject.phone_account_id },
        { latitude: data.latitude, longitude: data.longitude });
    });
  });
}

function initSocket(socket, AuthenticationEventName,
  BOSchema, SuccessfullAuthEventName, socketType) {
  socketAuth(socket, AuthenticationEventName,
    BOSchema, SuccessfullAuthEventName, socketType);


  socketPositionChange(socket, BOSchema);
}

function init(server) {
  io = socketIO(server);
  io.on('connection', (socket) => {
    initSocket(socket, CITIZEN_AUNTENTICATION_EVENT, Citizen,
      CITIZEN_AUTH_SUCCESS_EVENT, CITIZEN_SOCKET_TYPE);

    initSocket(socket, DRIVER_AUNTENTICATION_EVENT, Driver,
      DRIVER_AUTH_SUCCESS_EVENT, DRIVER_SOCKET_TYPE);
  });
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


function getSocketByBOId(BusinessSchema, userId) {
  return new Promise((resolve, reject) => {
    findPhoneAccountFromUserId(BusinessSchema, userId)
      .then(({ phoneAccount }) => {
        console.log('phoneAccount.socketId');
        console.log(phoneAccount.socketId);

        const socket = getSocketById(phoneAccount.socketId);
        if (socket) { return resolve(socket); }
        return reject(SOCKET_NOT_FOUND);
      })
      .catch(err => reject(err));
  });
}

function joinRoom(BusinessSchema, userId, roomName) {
  return new Promise((resolve, reject) => {
    getSocketByBOId(BusinessSchema, userId)
      .then((socket) => {
        socket.join(roomName);
        resolve();
      })
      .catch(err => reject(err));
  });
}

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

module.exports = {
  init,
  joinRoom,
  sendMessageToBO,
  positionChangeRoomName,
  CITIZEN_SOCKET_TYPE,
  DRIVER_SOCKET_TYPE,
  NEW_ALARM_EVENT
};
