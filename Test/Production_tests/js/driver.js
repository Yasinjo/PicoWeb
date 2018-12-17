const API_HOST = 'http://localhost:9090';
const logElt = document.getElementById('log');
const longitudeElt = document.getElementById('longitude');
const latitudeElt = document.getElementById('latitude');
const newAlarmDiv = document.getElementById('new_alarm_div');

const citizenId = document.getElementById('citizen_id');
const citizenName = document.getElementById('citizen_name');
const citizenLongitude = document.getElementById('citizen_logitude');
const citizenLatitude = document.getElementById('citizen_latitude');

let socket;

const token = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzEyM2QzZmU0ZDkyNTA5ODgyYzI4NWIiLCJpYXQiOjE1NDQ5OTIwMDl9.Wybm5LiS28l9PzSrvxwNv7uTJbTkO6u98UlGw1sAYX0';

function socketAuthentication() {
  socket = io(API_HOST);
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
  });

  socket.on('CITIZEN_POSITION_CHANGE_EVENT', (data) => {
    console.log('Citizen position change :');
    citizenLongitude.innerHTML = data.longitude;
    citizenLatitude.innerHTML = data.latitude;
  });

  socket.on('connect', () => {
    logElt.innerHTML = 'Socket connected';
    socket.emit('DRIVER_AUNTENTICATION_EVENT', { token });
  });
}

function changePosition() {
  setInterval(() => {
    const message = {
      longitude: Math.random() * 100000,
      latitude: Math.random() * 100000,
    };

    longitudeElt.value = message.longitude;
    latitudeElt.value = message.latitude;

    logElt.innerHTML = 'Sending position change';
    socket.emit('POSITION_CHANGE_EVENT', message);
    logElt.innerHTML = 'Position changed';
  }, 1000);
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
