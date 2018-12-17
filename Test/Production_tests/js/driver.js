const API_HOST = 'http://localhost:9090';
const logElt = document.getElementById('log');
const longitudeElt = document.getElementById('longitude');
const latitudeElt = document.getElementById('latitude');
let socket;

const token = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzEyM2QzZmU0ZDkyNTA5ODgyYzI4NWIiLCJpYXQiOjE1NDQ5OTIwMDl9.Wybm5LiS28l9PzSrvxwNv7uTJbTkO6u98UlGw1sAYX0';

function socketAuthentication() {
  socket = io(API_HOST);
  socket.on('DRIVER_AUTH_SUCCESS_EVENT', () => {
    logElt.innerHTML = 'Waiting for alarms';
  });

  socket.on('NEW_ALARM_EVENT', (data) => {
    console.log('NEW_ALARM_EVENT');
    console.log(data);
  });

  socket.on('CITIZEN_POSITION_CHANGE_EVENT', (data) => {
    console.log('Citizen position change :');
    console.log(data);
  });

  socket.on('connect', () => {
    logElt.innerHTML = 'Socket connected';
    socket.emit('DRIVER_AUNTENTICATION_EVENT', { token });
  });
}

function changePosition() {
  const message = {
    longitude: longitudeElt.value,
    latitude: latitudeElt.value,
  };

  logElt.innerHTML = 'Sending position change';
  socket.emit('POSITION_CHANGE_EVENT', message);
  logElt.innerHTML = 'Position changed';
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
