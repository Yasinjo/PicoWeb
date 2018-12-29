

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

function initCitizenSocket(socket) {
  initSocket(socket, CITIZEN_AUNTENTICATION_EVENT, Citizen,
    CITIZEN_AUTH_SUCCESS_EVENT, CITIZEN_SOCKET_TYPE);

  socket.on(CITIZEN_FEEDBACK_EVENT, data => citizenFeedbackHandler(socket, data));
}

function leaveAlarmWaitingQueue(citizenSocket, ambulanceId) {
  citizenSocket.leave(ambulanceId);
}

function broadcastDriverSelection(ambulanceId) {
  io.to(ambulanceWaitingQueueRoomName(ambulanceId)).emit(OTHER_CITIZEN_SELECTION_EVENT);
}

function RemoveAmbulanceWaitingQueue(ambulanceId) {
  const roomName = ambulanceWaitingQueueRoomName(ambulanceId);
  io.sockets.clients(roomName).forEach((citizenSocket) => {
    citizenSocket.leave(roomName);
  });
}
