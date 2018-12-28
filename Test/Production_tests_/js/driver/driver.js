const API_HOST = 'http://localhost:9090';
// const API_HOST = 'http://pico.ossrv.nl:9090';

function byId(id) {
  return document.getElementById(id);
}

const pNumber = byId('phone_number');
const pswd = byId('pswd');
const loginError = byId('login_error');
const loginDiv = byId('login_div');
const currentPositionDiv = byId('current_position_div');
const longitudeElt = byId('longitude');
const latitudeElt = byId('latitude');
const labelDiv = byId('label_div');
let tokenVar = localStorage.getItem('driver_token');
let socket;

function initPositionTimer() {
  currentPositionDiv.className = 'visible';
  setInterval(() => {
    const message = {
      longitude: Math.random() * 100000,
      latitude: Math.random() * 100000
    };

    longitudeElt.innerHTML = message.longitude;
    latitudeElt.innerHTML = message.latitude;

    socket.emit('POSITION_CHANGE_EVENT', message);
  }, 2000);
}

function main() {
  labelDiv.className = 'visible';
  labelDiv.innerHTML = '<b>Waiting for citizens alarms</b>';
}


function initSocket() {
  socket = io(`${API_HOST}?userType=DRIVER_SOCKET_TYPE`);
  socket.on('DRIVER_AUTH_SUCCESS_EVENT', () => {
    initPositionTimer();
    main();
  });
  socket.on('connect', () => {
    socket.emit('DRIVER_AUNTENTICATION_EVENT', { token: tokenVar });
  });
}

function login() {
  loginError.innerHTML = null;
  const data = JSON.stringify({
    phone_number: pNumber.value,
    password: pswd.value
  });

  if (tokenVar) {
    loginDiv.className = 'hidden';
    return initSocket();
  }

  fetch(`${API_HOST}/api/drivers/signin`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    })
    .then(response => response.json())
    .then((jsonResponse) => {
      if (!jsonResponse.success) {
        loginError.innerHTML = jsonResponse.msg;
        return;
      }

      tokenVar = jsonResponse.token;
      localStorage.setItem('driver_token', tokenVar);
      loginDiv.className = 'hidden';
      initSocket();
    })
    .catch((err) => {
      console.log('err :');
      console.log(err);
    });
}

if (tokenVar) {
  loginDiv.className = 'hidden';
  initSocket();
}
