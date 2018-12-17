const API_HOST = 'http://localhost:9090';
const logElt = document.getElementById('log');
const longitudeElt = document.getElementById('longitude');
const latitudeElt = document.getElementById('latitude');
const driverInfosDiv = document.getElementById('driver_infos_location');

const driverInfoKeys = ['driver_id', 'driver_full_name', 'ambulance_registration_number', 'ambulance_longitude', 'ambulance_latitude'];
const driverInfo = {};

for (const key of driverInfoKeys) {
  driverInfo[key] = document.getElementById(key);
}

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
