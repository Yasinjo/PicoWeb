const socketIO = require('socket.io');
const _ = require('lodash');
const { extractUserIdFromToken } = require('../auth/tokenExtractors');
const GenericDAO = require('../dao/genericDAO');
const Citizen = require('../bo/citizen.bo');
const Driver = require('../bo/driver.bo');
const Alarm = require('../bo/alarm.bo');
const Ambulance = require('../bo/ambulance.bo');
const Feedback = require('../bo/feedback.bo');
const { PhoneAccount } = require('../bo/phone_account.bo');
const { findPhoneAccountFromUserId } = require('../helpers/phoneAccountHelpers');

const CITIZEN_AUNTENTICATION_EVENT = 'CITIZEN_AUNTENTICATION_EVENT';
const DRIVER_AUNTENTICATION_EVENT = 'DRIVER_AUNTENTICATION_EVENT';
const CITIZEN_AUTH_SUCCESS_EVENT = 'CITIZEN_AUTH_SUCCESS_EVENT';
const DRIVER_AUTH_SUCCESS_EVENT = 'DRIVER_AUTH_SUCCESS_EVENT';
const NEW_ALARM_EVENT = 'NEW_ALARM_EVENT';
const POSITION_CHANGE_EVENT = 'POSITION_CHANGE_EVENT';
const MISSION_ACCOMPLISHED_EVENT = 'MISSION_ACCOMPLISHED_EVENT';
const CITIZEN_SOCKET_TYPE = 'CITIZEN_SOCKET_TYPE';
const DRIVER_SOCKET_TYPE = 'DRIVER_SOCKET_TYPE';

const SOCKET_NOT_FOUND = 'SOCKET_NOT_FOUND';
const ALARM_NOT_FOUND_EVENT = 'ALARM_NOT_FOUND_EVENT';
const UNAUTHORIZED_MISSION_COMPLETION_EVENT = 'UNAUTHORIZED_MISSION_COMPLETION_EVENT';

const CITIZEN_FEEDBACK_EVENT = 'CITIZEN_FEEDBACK_EVENT';
const UNAUTHORIZED_FEEDBACK_EVENT = 'UNAUTHORIZED_FEEDBACK_EVENT';

const AMBULANCE_POSITION_CHANGE_EVENT = 'AMBULANCE_POSITION_CHANGE_EVENT';
const CITIZEN_POSITION_CHANGE_EVENT = 'CITIZEN_POSITION_CHANGE_EVENT';
const FAKE_ALARM_EVENT = 'FAKE_ALARM_EVENT';
const ACCOUNT_DEACTIVATED_EVENT = 'ACCOUNT_DEACTIVATED_EVENT';
const SUCCESSFUL_FAKE_ALARM_DECLARATION_EVENT = 'SUCCESSFUL_FAKE_ALARM_DECLARATION_EVENT';

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
        resolve();
      })
      .catch(err => reject({ socketType, err }));
  });
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

        getSocketByBOId(Citizen, alarm.citizen_id)
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

function makeAmbulanceAvailable(ambulanceId) {
  GenericDAO.updateFields(Ambulance, { _id: ambulanceId }, { available: true }, (err) => {
    if (err) {
      console.log('makeAmbulanceAvailable error :');
      console.log(err);
    }
  });
}

function finishMission(citizenSocket, driverSocket, alarm) {
  if (alarm && alarm.ambulance_id) { makeAmbulanceAvailable(alarm.ambulance_id); }
  if (citizenSocket) {
    citizenSocket.leave(positionChangeRoomName(DRIVER_SOCKET_TYPE, driverSocket.userId));
  }
  if (driverSocket) {
    driverSocket.leave(positionChangeRoomName(CITIZEN_SOCKET_TYPE, citizenSocket.userId));
  }
}

function missionAccomplishedHandler(driverSocket, data) {
  if (!isSocketAuth(driverSocket)) return;
  verifyDriverResponseToAlarmData(driverSocket, data)
    .then(({ alarm, citizenSocket }) => {
      finishMission(citizenSocket, driverSocket, alarm);
      if (citizenSocket) {
        citizenSocket.emit(MISSION_ACCOMPLISHED_EVENT,
          { driver_id: driverSocket.userId, alarm_id: alarm._id });
      }
    });
}

function deactivateCitizenAccount(citizenId) {
  GenericDAO.deactivateCitizenAccount(citizenId, (err) => {
    if (err) {
      console.log('deactivateCitizenAccount error :');
      console.log(err);
    }
  });
}

function deactivateCitizenSocket(citizenSocket) {
  setSocketAuth(citizenSocket, false);
  // citizenSocket.disconnect();
}

function notifyDeactivatedCitizen(citizenSocket, driverId) {
  GenericDAO.findOne(Driver, { _id: driverId }, (err, driver) => {
    const msg = { driver_id: driverId };
    if (driver) { msg.driver_full_name = driver.full_name; }
    citizenSocket.emit(ACCOUNT_DEACTIVATED_EVENT, msg);
  });
}

function fakeAlarmHandler(driverSocket, data) {
  if (!isSocketAuth(driverSocket)) return;
  verifyDriverResponseToAlarmData(driverSocket, data)
    .then(({ citizenSocket, alarm }) => {
      finishMission(citizenSocket, driverSocket, alarm);
      if (citizenSocket) {
        deactivateCitizenAccount(citizenSocket.userId);
        notifyDeactivatedCitizen(citizenSocket, driverSocket.userId);
        deactivateCitizenSocket(citizenSocket);
      }

      GenericDAO.saveAlarmAsFalse(alarm._id, driverSocket.userId);
      driverSocket.emit(SUCCESSFUL_FAKE_ALARM_DECLARATION_EVENT);
    });
}

function verifyCitizenFeedbackData(socket, data) {
  return new Promise((resolve) => {
    if (!data.alarm_id || !data.percentage) { return socket.emit(ALARM_NOT_FOUND_EVENT); }

    return GenericDAO.findOne(Alarm, { _id: data.alarm_id }, (err, alarm) => {
      if (err || !alarm) return socket.emit(ALARM_NOT_FOUND_EVENT);
      if (alarm.citizen_id.toString() !== socket.userId.toString()) {
        return socket.emit(UNAUTHORIZED_FEEDBACK_EVENT);
      }

      return GenericDAO.findAmbulanceDriver(alarm.ambulance_id)
        .then(driver => resolve({ driver, alarm }))
        .catch((err2) => {
          console.log('verifyCitizenFeedbackData error :');
          console.log(err2);
          return resolve({ alarm });
        });
    });
  });
}

function saveFeedBack(feedbackData) {
  const feedback = new Feedback(feedbackData);
  GenericDAO.save(feedback);
}


function citizenFeedbackHandler(citizenSocket, data) {
  if (!isSocketAuth(citizenSocket)) return;
  verifyCitizenFeedbackData(citizenSocket, data)
    .then(({ driver }) => {
      const feedbackData = {
        citizen_id: citizenSocket.userId,
        driver_id: driver._id,
        comment: data.comment,
        percentage: data.percentage
      };

      saveFeedBack(feedbackData);
      return getSocketByBOId(Driver, driver._id);
    })
    .then((driverSocket) => {
      const message = {
        alarm_id: data.alarm_id,
        citizen_id: citizenSocket.userId,
        comment: data.comment,
        percentage: data.percentage
      };

      driverSocket.emit(CITIZEN_FEEDBACK_EVENT, message);
    })
    .catch((err) => {
      console.log('citizenFeedbackHandler error :');
      console.log(err);
    });
}

function initSocket(socket, AuthenticationEventName,
  BOSchema, SuccessfullAuthEventName, socketType) {
  socketAuth(socket, AuthenticationEventName,
    BOSchema, SuccessfullAuthEventName, socketType);

  socketPositionChange(socket, BOSchema);

  socketDisconnect(socket, BOSchema);
}

function initCitizenSocket(socket) {
  initSocket(socket, CITIZEN_AUNTENTICATION_EVENT, Citizen,
    CITIZEN_AUTH_SUCCESS_EVENT, CITIZEN_SOCKET_TYPE);

  socket.on(CITIZEN_FEEDBACK_EVENT, data => citizenFeedbackHandler(socket, data));
}

function initDriverSocket(socket) {
  initSocket(socket, DRIVER_AUNTENTICATION_EVENT, Driver,
    DRIVER_AUTH_SUCCESS_EVENT, DRIVER_SOCKET_TYPE);

  socket.on(MISSION_ACCOMPLISHED_EVENT, data => missionAccomplishedHandler(socket, data));
  socket.on(FAKE_ALARM_EVENT, data => fakeAlarmHandler(socket, data));
}

function init(server) {
  io = socketIO(server);

  io.on('connection', (socket) => {
    if (socket.handshake.query.userType === CITIZEN_SOCKET_TYPE) {
      initCitizenSocket(socket);
    } else if (socket.handshake.query.userType === DRIVER_SOCKET_TYPE) {
      initDriverSocket(socket);
    }
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
