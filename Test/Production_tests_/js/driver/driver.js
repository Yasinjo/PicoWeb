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
const alarmsDiv = byId('alarms_div');
const alarmsTable = byId('alarms_table');
const citizenInfoDiv = byId('citizen_info_div');
const citizenImage = byId('citizen_image');
const citizenName = byId('citizen_name');
const citizenLatitude = byId('citizen_latitude');
const citizenLongitude = byId('citizen_longitude');

let currentAlarmId;

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

function createCitizenPicture(citizenId) {
  const img = document.createElement('IMG');
  img.setAttribute('src', `http://localhost:9090/api/citizens/image/${citizenId}.jpg`);
  img.setAttribute('width', '300');
  return img;
}

function createApproveButton(alarmId, citizenId, fullName, citizenLatitude, citizenLongitude) {
  const btn = document.createElement('BUTTON');
  const t = document.createTextNode('Approve');
  btn.appendChild(t);
  btn.onclick = () => {
    currentAlarmId = alarmId;
    socket.emit('ACCEPTED_REQUEST_EVENT', { alarm_id: alarmId });
    alarmsDiv.className = 'hidden';
    citizenInfoDiv.className = 'visible';
    citizenImage.setAttribute('src', `http://localhost:9090/api/citizens/image/${citizenId}.jpg`);
    citizenImage.setAttribute('width', '300');
    citizenName.innerHTML = fullName;
    citizenLatitude.innerHTML = citizenLatitude;
    citizenLongitude.innerHTML = citizenLongitude;
  };

  return btn;
}

function createRejectButton(alarmId) {
  const btn = document.createElement('BUTTON');
  const t = document.createTextNode('Reject');
  btn.appendChild(t);
  btn.onclick = () => {
    socket.emit('REJECTED_REQUEST_EVENT', { alarm_id: alarmId });
    // remove row
    const row = byId('alarmId');
    row.parentNode.removeChild(row);
  };
  return btn;
}

function newAlarmEventHandler(data) {
  alarmsDiv.className = 'visible';
  labelDiv.className = 'hidden';

  const row = alarmsTable.insertRow(-1);
  row.setAttribute('id', data.alarm_id);

  const citizenPicture = row.insertCell(0);
  const name = row.insertCell(1);
  const latitude = row.insertCell(2);
  const longitude = row.insertCell(3);
  const approve = row.insertCell(4);
  const reject = row.insertCell(5);

  citizenPicture.appendChild(createCitizenPicture(data.citizen_id));
  approve.appendChild(
    createApproveButton(data.alarm_id, data.citizen_id, data.full_name, data.latitude, data.longitude)
  );
  reject.appendChild(createRejectButton(data.alarm_id));

  name.innerHTML = data.full_name;
  latitude.innerHTML = data.latitude;
  longitude.innerHTML = data.longitude;
}

function initSocket() {
  socket = io(`${API_HOST}?userType=DRIVER_SOCKET_TYPE`);
  socket.on('ALARM_NOT_FOUND_EVENT', () => console.log('ALARM_NOT_FOUND_EVENT'));
  socket.on('UNAUTHORIZED_MISSION_COMPLETION_EVENT', () => console.log('UNAUTHORIZED_MISSION_COMPLETION_EVENT'));
  socket.on('NEW_ALARM_EVENT', newAlarmEventHandler);
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
