const GenericDAO = require('../../dao/genericDAO');
const Driver = require('../../bo/driver.bo');
const Alarm = require('../../bo/alarm.bo');
const Citizen = require('../../bo/citizen.bo');
const Feedback = require('../../bo/feedback.bo');

const {
  setSocketAuth, initSocket, isSocketAuth, getSocketByBOId,
  ambulanceWaitingQueueRoomName, getSocketServer
} = require('../index');
const {
  ACCOUNT_DEACTIVATED_EVENT, ALARM_NOT_FOUND_EVENT, UNAUTHORIZED_FEEDBACK_EVENT,
  CITIZEN_AUNTENTICATION_EVENT, CITIZEN_AUTH_SUCCESS_EVENT, CITIZEN_SOCKET_TYPE,
  CITIZEN_FEEDBACK_EVENT, OTHER_CITIZEN_SELECTION_EVENT, REJECTED_REQUEST_EVENT
} = require('../constants/index');


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
}

function notifyDeactivatedCitizen(citizenSocket, driverId) {
  GenericDAO.findOne(Driver, { _id: driverId }, (err, driver) => {
    const msg = { driver_id: driverId };
    if (driver) { msg.driver_full_name = driver.full_name; }
    citizenSocket.emit(ACCOUNT_DEACTIVATED_EVENT, msg);
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

function leaveAlarmWaitingQueue(citizenSocket, ambulanceId) {
  citizenSocket.leave(ambulanceWaitingQueueRoomName(ambulanceId));
}

function broadcastDriverSelection(ambulanceId) {
  const socketServer = getSocketServer();
  socketServer.to(ambulanceWaitingQueueRoomName(ambulanceId)).emit(OTHER_CITIZEN_SELECTION_EVENT);
}

function initCitizenSocket(socket) {
  initSocket(socket, CITIZEN_AUNTENTICATION_EVENT, Citizen,
    CITIZEN_AUTH_SUCCESS_EVENT, CITIZEN_SOCKET_TYPE);

  socket.on(CITIZEN_FEEDBACK_EVENT, data => citizenFeedbackHandler(socket, data));
}

function sendRejectionToCitizen(citizenSocket, alarmId) {
  citizenSocket.emit(REJECTED_REQUEST_EVENT, { alarm_id: alarmId });
}

module.exports = {
  initCitizenSocket,
  deactivateCitizenAccount,
  notifyDeactivatedCitizen,
  deactivateCitizenSocket,
  leaveAlarmWaitingQueue,
  broadcastDriverSelection,
  sendRejectionToCitizen
};
