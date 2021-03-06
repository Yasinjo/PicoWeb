// const API_HOST = 'http://localhost:9090';
const API_HOST = 'http://pico.ossrv.nl:9090';
const logElt = document.getElementById('log');
const longitudeElt = document.getElementById('longitude');
const latitudeElt = document.getElementById('latitude');
const driverInfosDiv = document.getElementById('driver_infos_location');
const driverIdFeedback = document.getElementById('driver_id_feedback');
const alarmIdFeedback = document.getElementById('alarm_id_feedback');
const feedbackPanel = document.getElementById('feedbackPanel');
const commentField = document.getElementById('comment');
const percentageField = document.getElementById('percentage');
const myPositionDiv = document.getElementById('my_position');

const driverInfoKeys = ['driver_id', 'driver_full_name', 'ambulance_registration_number', 'driver_longitude', 'driver_latitude'];
const driverInfo = {};
let currentPositionIndex = 0;
let currentAlarmID;

const staticPosition = [
  { latitude: 33.698424, longitude: -7.383894 },
  { latitude: 33.698638, longitude: -7.383121 }
  ];

for (const key of driverInfoKeys) {
  driverInfo[key] = document.getElementById(key);
}

let socket;

const token = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzFmODk5ODQxNzFiZjM3MTAwMWQzM2MiLCJpYXQiOjE1NDU1NzA3MjF9.YFZ2JLHUBiDv7tNcFhpH1u8aBZ0_t8yoRfLdKa4vyPU';
const ambulanceId = '5bf54f597f47c57269b73f1c';

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
      console.log(responseJSON);

      if (!responseJSON.success) { logElt.innerHTML = responseJSON.msg; return; }

      driverInfosDiv.className = 'visible';
      for (const key in driverInfo) {
        driverInfo[key].innerHTML = responseJSON.driver[key];
      }
    });
}

function missionAccomplishedHandler(data) {
  driverIdFeedback.innerHTML = data.driver_id;
  alarmIdFeedback.innerHTML = data.alarm_id;
  currentAlarmID = data.alarm_id;
  feedbackPanel.className = 'visible';
}

function accountDesactivatedHandler(data) {
  driverInfosDiv.className = 'hidden';
  myPositionDiv.className = 'hidden';
  logElt.innerHTML = `<h2>Account deactivated by id : ${data.driver_id} | name : ${data.driver_full_name}</h2>`;
}

function socketAuthentication() {
  socket = io(`${API_HOST}?userType=CITIZEN_SOCKET_TYPE`);
  socket.on('CITIZEN_AUTH_SUCCESS_EVENT', () => {
    logElt.innerHTML = 'Socket authenticated';
    sendAlarm();
  });

  socket.on('AMBULANCE_POSITION_CHANGE_EVENT', (data) => {
    driverInfo.driver_latitude.innerHTML = data.latitude;
    driverInfo.driver_longitude.innerHTML = data.longitude;
  });

  socket.on('MISSION_ACCOMPLISHED_EVENT', missionAccomplishedHandler);

  socket.on('ALARM_NOT_FOUND_EVENT', () => console.log('ALARM_NOT_FOUND_EVENT'));
  socket.on('UNAUTHORIZED_FEEDBACK_EVENT', () => console.log('UNAUTHORIZED_FEEDBACK_EVENT'));
  socket.on('ACCOUNT_DEACTIVATED_EVENT', accountDesactivatedHandler);

  socket.on('connect', () => {
    logElt.innerHTML = 'Socket connected';
    socket.emit('CITIZEN_AUNTENTICATION_EVENT', { token });
  });
}

function changePosition() {
  intervalID = setInterval(() => {
    if (currentPositionIndex === staticPosition.length) {
      // clearInterval(intervalID);
      currentPositionIndex = 0;
      return;
    }
    const message = {
      latitude: staticPosition[currentPositionIndex].latitude,
      longitude: staticPosition[currentPositionIndex].longitude,
    };

    longitudeElt.value = message.longitude;
    latitudeElt.value = message.latitude;

    currentPositionIndex += 1;
    socket.emit('POSITION_CHANGE_EVENT', message);
  }, 2000);
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
