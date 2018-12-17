const API_HOST = 'http://localhost:9090';
const logElt = document.getElementById('log');
const longitudeElt = document.getElementById('longitude');
const latitudeElt = document.getElementById('latitude');
let socket;

const token = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzEyM2Y1MGE0MjNiMDI0ZTg5ZGJjMDciLCJpYXQiOjE1NDQ4MTYxMzJ9.znGzy44xdHaMfwkbMfE4vSY5lCzgAb_o-_RMEsq1bWQ';
const ambulanceId = '5bf54f597f47c57269b73f1e';
// Authenticate with socket
// Send alarm to an available ambulance (static)
// See ambulance position, driver name and position
// See real time, change of position
// Change the citizen position

// Send alarm to an available ambulance (static)
function sendAlarm() {
  const data = JSON.stringify({
    ambulance_id: ambulanceId
  });

  console.log(data);

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
    .then((myJson) => {
      console.log('API response');
      console.log(myJson);
    });
}

function socketAuthentication() {
  socket = io(API_HOST);
  socket.on('CITIZEN_AUTH_SUCCESS_EVENT', () => {
    logElt.innerHTML = 'Socket authenticated';
    sendAlarm();
  });

  socket.on('AMBULANCE_POSITION_CHANGE_EVENT', (data) => {
    console.log('Ambulance position change :');
    console.log(data);
  });

  socket.on('connect', () => {
    logElt.innerHTML = 'Socket connected';
    socket.emit('CITIZEN_AUNTENTICATION_EVENT', { token });
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
