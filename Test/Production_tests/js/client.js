const API_HOST = 'http://localhost:9090';
const logElt = document.getElementById('log');
const longitudeElt = document.getElementById('longitude');
const latitudeElt = document.getElementById('latitude');
const driverInfosDiv = document.getElementById('driver_infos_location');
const driverIdFeedback = document.getElementById('driver_id_feedback');
const alarmIdFeedback = document.getElementById('alarm_id_feedback');
const feedbackPanel = document.getElementById('feedbackPanel');
const commentField = document.getElementById('comment');
const percentageField = document.getElementById('percentage');

const driverInfoKeys = ['driver_id', 'driver_full_name', 'ambulance_registration_number', 'ambulance_longitude', 'ambulance_latitude'];
const driverInfo = {};
let currentAlarmID;

for (const key of driverInfoKeys) {
  driverInfo[key] = document.getElementById(key);
}

let socket;

const token = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzEyM2Y1MGE0MjNiMDI0ZTg5ZGJjMDciLCJpYXQiOjE1NDQ4MTYxMzJ9.znGzy44xdHaMfwkbMfE4vSY5lCzgAb_o-_RMEsq1bWQ';
const ambulanceId = '5bf54f597f47c57269b73f1e';

function sendAlarm() {
  const data = JSON.stringify({
    ambulance_id: ambulanceId
  });

  logElt.innerHTML = 'Sending alarm';
  fetch(`${API_HOST}/api/alarms/citizens`,
    {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      body: data
    })
    .then(response => response.json())
    .then((responseJSON) => {
      if (!responseJSON.success) { logElt.innerHTML = responseJSON.msg; return; }

      driverInfosDiv.className = 'visible';
      for (const key in driverInfo) {
        driverInfo[key].innerHTML = responseJSON[key];
      }
    });
}

function missionAccomplishedHandler(data) {
  driverIdFeedback.innerHTML = data.driver_id;
  alarmIdFeedback.innerHTML = data.alarm_id;
  currentAlarmID = data.alarm_id;
  feedbackPanel.className = 'visible';
}

function socketAuthentication() {
  socket = io(`${API_HOST}?userType=CITIZEN_SOCKET_TYPE`);
  socket.on('CITIZEN_AUTH_SUCCESS_EVENT', () => {
    logElt.innerHTML = 'Socket authenticated';
    sendAlarm();
  });

  socket.on('AMBULANCE_POSITION_CHANGE_EVENT', (data) => {
    driverInfo.ambulance_latitude.innerHTML = data.latitude;
    driverInfo.ambulance_longitude.innerHTML = data.longitude;
  });

  socket.on('MISSION_ACCOMPLISHED_EVENT', missionAccomplishedHandler);

  socket.on('ALARM_NOT_FOUND_EVENT', () => console.log('ALARM_NOT_FOUND_EVENT'));
  socket.on('UNAUTHORIZED_FEEDBACK_EVENT', () => console.log('UNAUTHORIZED_FEEDBACK_EVENT'));

  socket.on('connect', () => {
    logElt.innerHTML = 'Socket connected';
    socket.emit('CITIZEN_AUNTENTICATION_EVENT', { token });
  });
}

function changePosition() {
  setInterval(() => {
    const message = {
      longitude: Math.random() * 100000,
      latitude: Math.random() * 100000
    };

    longitudeElt.value = message.longitude;
    latitudeElt.value = message.latitude;

    socket.emit('POSITION_CHANGE_EVENT', message);
  }, 1000);
}

function sendFeedback() {
  const message = {
    alarm_id: currentAlarmID,
    percentage: percentageField.options[percentageField.selectedIndex].value,
    comment: commentField.value,
  };

  socket.emit('CITIZEN_FEEDBACK_EVENT', message);
}


// function login() {
//   fetch(`${API_HOST}/api/citizens/signin`,
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: data
//     })
//     .then(response => response.json())
//     .then((myJson) => {
//       console.log(myJson);
//     });
// }

socketAuthentication();
changePosition();
