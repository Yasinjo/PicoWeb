const socketIO = require('socket.io');
const _ = require('lodash');
const { extractUserIdFromToken } = require('../auth/tokenExtractors');
const GenericDAO = require('../dao/genericDAO');
const Citizen = require('../bo/citizen.bo');
const Driver = require('../bo/driver.bo');
const { positionRoomNameFromDriver } = require('../routes/alarms/helpers/index');

const CITIZEN_AUNTENTICATION_EVENT = 'CITIZEN_AUNTENTICATION_EVENT';
const CITIZEN_AUTH_SUCCESS_EVENT = 'CITIZEN_AUTH_SUCCESS_EVENT';
const DRIVER_AUNTENTICATION_EVENT = 'DRIVER_AUNTENTICATION_EVENT';
const DRIVER_AUTH_SUCCESS_EVENT = 'DRIVER_AUTH_SUCCESS_EVENT';
const NEW_ALARM_EVENT = 'NEW_ALARM_EVENT';
const POSITION_CHANGE_EVENT = 'POSITION_CHANGE_EVENT';
const CITIZEN_SOCKET_TYPE = 'CITIZEN_SOCKET_TYPE';
const DRIVER_SOCKET_TYPE = 'DRIVER_SOCKET_TYPE';
const CITIZEN_NAMESPACE = 'CITIZEN_NAMESPACE';
const DRIVER_NAMESPACE = 'DRIVER_NAMESPACE';

const AMBULANCE_POSITION_CHANGE_EVENT = 'AMBULANCE_POSITION_CHANGE_EVENT';
const CITIZEN_POSITION_CHANGE_EVENT = 'CITIZEN_POSITION_CHANGE_EVENT';

let io = null;

function socketAuth(socket, AuthenticationEventName,
  BOSchema, SuccessfullAuthEventName, socketType) {
  socket.auth = false;
  socket.on(AuthenticationEventName, (data) => {
    extractUserIdFromToken(data.token)
      .then((userId) => {
        GenericDAO.findOne(BOSchema, { _id: userId }, (err) => {
          if (err) return;
          socket.auth = true;
          socket.userId = userId;
          socket.socketType = socketType;

          if (socketType === DRIVER_SOCKET_TYPE) {
            socket.join(positionRoomNameFromDriver(userId));
          }

          socket.emit(SuccessfullAuthEventName, { success: true, socket_id: socket.id });
        });
        // Android communication
      }).catch();
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

    socket.to(positionRoomNameFromDriver(socket.userId))
      .emit(eventName, msg);

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
  const citizenNsp = io.of(CITIZEN_NAMESPACE);
  const driverNsp = io.of(DRIVER_NAMESPACE);
  citizenNsp.on('connection', socket => initSocket(socket, CITIZEN_AUNTENTICATION_EVENT, Citizen,
    CITIZEN_AUTH_SUCCESS_EVENT, CITIZEN_SOCKET_TYPE));

  driverNsp.on('connection', socket => initSocket(socket, DRIVER_AUNTENTICATION_EVENT, Driver,
    DRIVER_AUTH_SUCCESS_EVENT, DRIVER_SOCKET_TYPE));
}

function matchSocketToToken(socketId, token) {
  return Promise((resolve, reject) => {
    const socket = this.io.sockets.connected[socketId];
    if (!socket) return reject();

    return extractUserIdFromToken(token)
      .then(userId => ((socket.userId === userId) ? resolve(socket, userId) : reject()))
      .catch(() => reject);
  });
}

module.exports = {
  init,
  matchSocketToToken,
  NEW_ALARM_EVENT
};
