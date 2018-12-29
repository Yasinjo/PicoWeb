const GenericDAO = require('../../dao/genericDAO');
const Alarm = require('../../bo/alarm.bo');
const Driver = require('../../bo/driver.bo');
const { findPhoneAccountFromUserId } = require('../../helpers/phoneAccountHelpers');
const {
  DRIVER_SOCKET_TYPE, CITIZEN_SOCKET_TYPE, SUCCESSFUL_FAKE_ALARM_DECLARATION_EVENT,
  ACCEPTED_REQUEST_EVENT, DRIVER_AUNTENTICATION_EVENT, DRIVER_AUTH_SUCCESS_EVENT,
  REJECTED_REQUEST_EVENT, MISSION_ACCOMPLISHED_EVENT, FAKE_ALARM_EVENT
} = require('../constants/index');

const {
  deactivateCitizenAccount, notifyDeactivatedCitizen, deactivateCitizenSocket,
  leaveAlarmWaitingQueue, broadcastDriverSelection, sendRejectionToCitizen
} = require('../citizens/index');

const {
  changeAmbulanceAvailablity, positionChangeRoomName, isSocketAuth, verifyDriverResponseToAlarmData,
  linkCitizenAndDriverSockets, RemoveAmbulanceWaitingQueue, initSocket
} = require('../index');

function finishMission(citizenSocket, driverSocket, alarm) {
  if (alarm && alarm.ambulance_id) { changeAmbulanceAvailablity(alarm.ambulance_id, true); }
  if (citizenSocket) {
    citizenSocket.leave(positionChangeRoomName(DRIVER_SOCKET_TYPE, driverSocket.userId));
  }
  if (driverSocket) {
    driverSocket.leave(positionChangeRoomName(CITIZEN_SOCKET_TYPE, citizenSocket.userId));
  }
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

function changeAlarmAcceptanceState(alarmId, acceptanceState) {
  GenericDAO.updateFields(Alarm, { _id: alarmId }, { accepted: acceptanceState }, (err) => {
    if (err) {
      console.log('changeAlarmAcceptanceState error :');
      console.log(err);
    }
  });
}

function sendDriverDetailsToCitizen(citizenSocket, driverId) {
  findPhoneAccountFromUserId(Driver, driverId)
    .then(({ businessObject, phoneAccount }) => {
      const message = {
        driver_id: driverId,
        driver_full_name: businessObject.full_name,
        driver_longitude: phoneAccount.longitude,
        driver_latitude: phoneAccount.latitude
      };

      citizenSocket.emit(ACCEPTED_REQUEST_EVENT, message);
    });
}

function acceptAlarmRequest(driverSocket, citizenSocket, alarm) {
  changeAmbulanceAvailablity(alarm.ambulance_id, false);
  changeAlarmAcceptanceState(alarm._id, true);
  sendDriverDetailsToCitizen(citizenSocket, driverSocket.userId);
  linkCitizenAndDriverSockets(citizenSocket, driverSocket);
  leaveAlarmWaitingQueue(citizenSocket, alarm.ambulance_id);
  broadcastDriverSelection(alarm.ambulance_id);
  RemoveAmbulanceWaitingQueue(alarm.ambulance_id);
}


function acceptedRequestHandler(driverSocket, data) {
  if (!isSocketAuth(driverSocket)) return;
  verifyDriverResponseToAlarmData(driverSocket, data)
    .then(({ alarm, citizenSocket }) => {
      acceptAlarmRequest(driverSocket, citizenSocket, alarm);
    });
}

function rejectAlarmRequest(citizenSocket, alarm) {
  leaveAlarmWaitingQueue(citizenSocket, alarm.ambulance_id);
  sendRejectionToCitizen(citizenSocket, alarm._id);
}

function rejectedRequestHandler(driverSocket, data) {
  if (!isSocketAuth(driverSocket)) return;
  verifyDriverResponseToAlarmData(driverSocket, data)
    .then(({ alarm, citizenSocket }) => {
      rejectAlarmRequest(citizenSocket, alarm);
    });
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

function initDriverSocket(socket) {
  initSocket(socket, DRIVER_AUNTENTICATION_EVENT, Driver,
    DRIVER_AUTH_SUCCESS_EVENT, DRIVER_SOCKET_TYPE);

  socket.on(ACCEPTED_REQUEST_EVENT, data => acceptedRequestHandler(socket, data));
  socket.on(REJECTED_REQUEST_EVENT, data => rejectedRequestHandler(socket, data));
  socket.on(MISSION_ACCOMPLISHED_EVENT, data => missionAccomplishedHandler(socket, data));
  socket.on(FAKE_ALARM_EVENT, data => fakeAlarmHandler(socket, data));
}


module.exports = {
  initDriverSocket
};
