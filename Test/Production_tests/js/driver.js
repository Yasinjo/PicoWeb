const API_HOST = 'http://localhost:9090';
// const API_HOST = 'http://pico.ossrv.nl:9090';
const logElt = document.getElementById('log');
const longitudeElt = document.getElementById('longitude');
const latitudeElt = document.getElementById('latitude');
const newAlarmDiv = document.getElementById('new_alarm_div');

const citizenId = document.getElementById('citizen_id');
const citizenName = document.getElementById('citizen_name');
const citizenLongitude = document.getElementById('citizen_logitude');
const citizenLatitude = document.getElementById('citizen_latitude');
const currentAlarmIDLabel = document.getElementById('current_alarm_id');
const newFeedback = document.getElementById('new_feedback');
const feedbackAlarmId = document.getElementById('feedback_alarm_id');
const feedbackCitizenId = document.getElementById('feedback_citizen_id');
const feedbackPercentage = document.getElementById('feedback_percentage');
const feedbackComment = document.getElementById('feedback_comment');
let currentAlarmID;
let socket;
let currentPositionIndex = 0;
let intervalID;
const staticPosition = [
  { latitude: 33.698424, longitude: -7.383894 },
  { latitude: 33.698638, longitude: -7.383121 },
  { latitude: 33.699495, longitude: -7.381619 },
  { latitude: 33.699923, longitude: -7.380546 },
  { latitude: 33.700602, longitude: -7.379345 },
  { latitude: 33.700995, longitude: -7.378358 },
  { latitude: 33.701352, longitude: -7.377757 },
  { latitude: 33.701637, longitude: -7.377070 },
  { latitude: 33.701887, longitude: -7.376298 },
  { latitude: 33.702244, longitude: -7.375568 },
  { latitude: 33.703743, longitude: -7.372049 },
  { latitude: 33.703993, longitude: -7.371319 },
  { latitude: 33.704243, longitude: -7.370676 },
  { latitude: 33.704993, longitude: -7.369130 },
  { latitude: 33.705957, longitude: -7.366341 },
  { latitude: 33.706349, longitude: -7.365225 },
  { latitude: 33.706420, longitude: -7.363980 },
  { latitude: 33.706349, longitude: -7.363293 },
  { latitude: 33.706206, longitude: -7.362006 },
  { latitude: 33.705991, longitude: -7.359130 },
  { latitude: 33.705741, longitude: -7.357842 },
  { latitude: 33.705703, longitude: -7.357112 },
  { latitude: 33.705317, longitude: -7.356924 },
  { latitude: 33.704996, longitude: -7.357374 },
  { latitude: 33.703710, longitude: -7.358404 },
  { latitude: 33.703050, longitude: -7.359188 },
  { latitude: 33.702550, longitude: -7.359928 },
  { latitude: 33.702104, longitude: -7.360411 },
  { latitude: 33.701702, longitude: -7.360936 },
  { latitude: 33.701184, longitude: -7.361537 },
  { latitude: 33.700765, longitude: -7.362127 },
  { latitude: 33.700453, longitude: -7.362449 },
  { latitude: 33.700301, longitude: -7.362664 }
];
const token = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzFmOGE1MzQxNzFiZjM3MTAwMWQzNDAiLCJpYXQiOjE1NDU1NzExMjd9.xJ15afIYLIznDY_vgTbvBPVcviu5SjlDDhsNKuXKzA8';

function newFeeedbackHandler(data) {
  newFeedback.className = 'visible';
  feedbackAlarmId.innerHTML = data.alarm_id;
  feedbackCitizenId.innerHTML = data.citizen_id;
  feedbackPercentage.innerHTML = data.percentage;
  feedbackComment.innerHTML = data.comment;
}

function socketAuthentication() {
  socket = io(`${API_HOST}?userType=DRIVER_SOCKET_TYPE`);
  socket.on('DRIVER_AUTH_SUCCESS_EVENT', () => {
    logElt.innerHTML = 'Waiting for alarms';
  });

  socket.on('NEW_ALARM_EVENT', (data) => {
    logElt.innerHTML = 'New alarm';
    newAlarmDiv.className = 'visible';

    citizenId.innerHTML = data.citizen_id;
    citizenName.innerHTML = data.full_name;
    citizenLongitude.innerHTML = data.longitude;
    citizenLatitude.innerHTML = data.latitude;
    currentAlarmIDLabel.innerHTML = data.alarm_id;
    currentAlarmID = data.alarm_id;
  });

  socket.on('CITIZEN_POSITION_CHANGE_EVENT', (data) => {
    citizenLongitude.innerHTML = data.longitude;
    citizenLatitude.innerHTML = data.latitude;
  });

  socket.on('ALARM_NOT_FOUND_EVENT', () => console.log('ALARM_NOT_FOUND_EVENT'));
  socket.on('UNAUTHORIZED_MISSION_COMPLETION_EVENT', () => console.log('UNAUTHORIZED_MISSION_COMPLETION_EVENT'));

  socket.on('CITIZEN_FEEDBACK_EVENT', newFeeedbackHandler);

  socket.on('connect', () => {
    logElt.innerHTML = 'Socket connected';
    socket.emit('DRIVER_AUNTENTICATION_EVENT', { token });
  });
}

function changePosition() {
  intervalID = setInterval(() => {
    if (currentPositionIndex === staticPosition.length) {
      return clearInterval(intervalID);
    }
    const message = {
      latitude: staticPosition[currentPositionIndex].latitude,
      longitude: staticPosition[currentPositionIndex].longitude,
    };

    longitudeElt.value = message.longitude;
    latitudeElt.value = message.latitude;

    currentPositionIndex += 1;
    socket.emit('POSITION_CHANGE_EVENT', message);
  }, 1000);
}

function missionAccomplished() {
  newAlarmDiv.className = 'hidden';
  socket.emit('MISSION_ACCOMPLISHED_EVENT', { alarm_id: currentAlarmID });
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
