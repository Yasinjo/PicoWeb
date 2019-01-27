// const API_HOST = 'http://localhost:9090';
const API_HOST = 'http://pico.ossrv.nl:9090';

function byId(id) {
  return document.getElementById(id);
}

const pNumber = byId('phone_number');
const pswd = byId('pswd');
const loginError = byId('login_error');
const loginDiv = byId('login_div');
const hospitalsDiv = byId('hospitals_div');
const hospitalsTable = byId('hospitals_table');
const ambulancesDiv = byId('ambulances_div');
const ambulancesTable = byId('ambulances_table');
const labelDiv = byId('label_div');
const currentPositionDiv = byId('current_position_div');
const longitudeElt = byId('longitude');
const latitudeElt = byId('latitude');
const driverInfoDiv = byId('driver_info_div');
const driverImage = byId('driver_image');
const driverName = byId('driver_name');
const driverLatitude = byId('driver_latitude');
const driverLongitude = byId('driver_longitude');
const selectOtherAmbulanceDiv = byId('select_other_ambulance_div');
const selectOtherAmbulanceLabel = byId('select_other_ambulance_label');
const missionAccomplishedDiv = byId('mission_accomplished_div');
const feedbackDiv = byId('feedback_div');
const feedbackPercentage = byId('feedback_percentage');
const feedbackComment = byId('feedback_comment');
const cancelAlarmDiv = byId('cancel_alarm_div');

let currentPositionIndex = 0;
const staticPosition = [
  { latitude: 33.700453, longitude: -7.362449 },
  { latitude: 33.700301, longitude: -7.362664 }];

let tokenVar = localStorage.getItem('token');
let socket;
let currentAlarmId;
let positionTimer;

function sendAlarm(ambulanceId) {
  labelDiv.className = 'visible';
  labelDiv.innerHTML = '<b>Sending alarm</b>';
  const data = JSON.stringify({
    ambulance_id: ambulanceId
  });

  fetch(`${API_HOST}/api/alarms/citizens`,
    {
      method: 'POST',
      headers: {
        Authorization: tokenVar,
        'Content-Type': 'application/json'
      },
      body: data
    })
    .then(response => response.json())
    .then((responseJSON) => {
      if (responseJSON.success) {
        currentAlarmId = responseJSON.alarm_id;
        labelDiv.innerHTML = '<b>Waiting for driver approval</b>';
        cancelAlarmDiv.className = 'visible';
      } else console.log(responseJSON);
    });
}

function createAmbulanceSelectionButton(ambulanceId) {
  const btn = document.createElement('BUTTON');
  const t = document.createTextNode('Select ambulance');
  btn.appendChild(t);
  btn.onclick = () => {
    ambulancesDiv.className = 'hidden';
    sendAlarm(ambulanceId);
  };
  return btn;
}

function createAmbulanceImage(ambulanceId) {
  const img = document.createElement('IMG');
  img.setAttribute('src', `${API_HOST}/api/ambulances/image/${ambulanceId}.jpg`);
  img.setAttribute('width', '300');
  return img;
}

function addAmbulanceRow(row, ambulance) {
  const registrationNumber = row.insertCell(0);
  const latitude = row.insertCell(1);
  const longitude = row.insertCell(2);
  const image = row.insertCell(3);
  const select = row.insertCell(4);

  registrationNumber.innerHTML = ambulance.registration_number;
  longitude.innerHTML = ambulance.longitude;
  latitude.innerHTML = ambulance.latitude;

  const selectButton = createAmbulanceSelectionButton(ambulance._id);
  const ambulanceImage = createAmbulanceImage(ambulance._id);
  image.appendChild(ambulanceImage);
  select.appendChild(selectButton);
}

function addAmbulancesRows(ambulances) {
  for (let i = 1; i <= ambulances.length; i += 1) {
    const row = ambulancesTable.insertRow(i);
    addAmbulanceRow(row, ambulances[i - 1]);
  }
}
function mainAmbulances(hospitalId) {
  ambulancesDiv.className = 'visible';
  fetch(`${API_HOST}/api/hospitals/citizens/${hospitalId}/ambulances`,
    {
      method: 'GET',
      headers: {
        Authorization: tokenVar,
        'Content-Type': 'application/json'
      },
    })
    .then(response => response.json())
    .then((jsonResponse) => {
      if (jsonResponse.ambulances) {
        addAmbulancesRows(jsonResponse.ambulances);
      } else {
        console.log(jsonResponse);
      }
    });
}

function createHospitalSelectionButton(hospitalId) {
  const btn = document.createElement('BUTTON');
  const t = document.createTextNode('Select hospital'); // Create a text node
  btn.appendChild(t);
  btn.onclick = () => {
    hospitalsDiv.className = 'hidden';
    mainAmbulances(hospitalId);
  };
  return btn;
}

function addHospitalRow(row, hospital) {
  const name = row.insertCell(0);
  const latitude = row.insertCell(1);
  const longitude = row.insertCell(2);
  const select = row.insertCell(3);

  name.innerHTML = hospital.name;
  longitude.innerHTML = hospital.longitude;
  latitude.innerHTML = hospital.latitude;

  const selectButton = createHospitalSelectionButton(hospital._id);
  select.appendChild(selectButton);
}

function addHospitalsRows(hospitals) {
  for (let i = 1; i <= hospitals.length; i += 1) {
    const row = hospitalsTable.insertRow(i);
    addHospitalRow(row, hospitals[i - 1]);
  }
}

function mainHospitals() {
  hospitalsDiv.className = 'visible';
  fetch(`${API_HOST}/api/hospitals/citizens`,
    {
      method: 'GET',
      headers: {
        Authorization: tokenVar,
        'Content-Type': 'application/json'
      },
    })
    .then(response => response.json())
    .then((jsonResponse) => {
      if (jsonResponse.hospitals) {
        addHospitalsRows(jsonResponse.hospitals);
      } else { console.log(jsonResponse); }
    });
}

function initPositionTimer() {
  currentPositionDiv.className = 'visible';
  positionTimer = setInterval(() => {
    if (currentPositionIndex === staticPosition.length) {
      currentPositionIndex = 0;
      return;
    }

    const message = {
      latitude: staticPosition[currentPositionIndex].latitude,
      longitude: staticPosition[currentPositionIndex].longitude,
    };

    longitudeElt.innerHTML = message.longitude;
    latitudeElt.innerHTML = message.latitude;

    socket.emit('POSITION_CHANGE_EVENT', message);
  }, 2000);
}

function createDriverImage(driverId) {
  const img = document.createElement('IMG');
  img.setAttribute('src', `${API_HOST}/api/drivers/image/${driverId}.jpg`);
  img.setAttribute('width', '300');
  return img;
}

/* Socket.io functions */
function acceptedRequestHandler(data) {
  console.log('ACCEPTED_REQUEST_EVENT');
  labelDiv.className = 'hidden';
  cancelAlarmDiv.className = 'hidden';
  driverInfoDiv.className = 'visible';
  driverImage.appendChild(createDriverImage(data.driver_id));
  driverName.innerHTML = data.driver_full_name;
  driverLatitude.innerHTML = data.driver_latitude;
  driverLongitude.innerHTML = data.driver_longitude;
}

function showSelectOtherAmbulanceLabel(labelContent) {
  selectOtherAmbulanceDiv.className = 'visible';
  selectOtherAmbulanceLabel.innerHTML = labelContent;
}

function rejectedRequestHandler(data) {
  console.log('REJECTED_REQUEST_EVENT');
  if (data.alarm_id === currentAlarmId) {
    labelDiv.className = 'hidden';
    cancelAlarmDiv.className = 'hidden';
    currentAlarmId = null;
    showSelectOtherAmbulanceLabel('Your request has been rejected');
  } else { console.error('Unappropriate alarm ID : rejectedRequestHandler'); }
}

function otherCitizenSelectionHandler() {
  console.log('OTHER_CITIZEN_SELECTION_EVENT');
  labelDiv.className = 'hidden';
  cancelAlarmDiv.className = 'hidden';
  showSelectOtherAmbulanceLabel('The driver has selected another citizen');
}

function ambulanceChangePositionHandler(data) {
  driverLatitude.innerHTML = data.latitude;
  driverLongitude.innerHTML = data.longitude;
}

function missionAccomplishedJHandler(data) {
  console.log('MISSION_ACCOMPLISHED_EVENT');
  if (data.alarm_id === currentAlarmId) {
    driverInfoDiv.className = 'hidden';
    missionAccomplishedDiv.className = 'visible';
  }
}

function accountDeactivatedHandler() {
  console.log('ACCOUNT_DEACTIVATED_EVENT');

  localStorage.removeItem('token');
  labelDiv.className = 'hidden';
  cancelAlarmDiv.className = 'hidden';
  driverInfoDiv.className = 'hidden';
  currentAlarmId = null;
  loginDiv.className = 'visible';
  loginError.innerHTML = 'Your account has been deactivated because of a false alarm';
  if (positionTimer) { clearInterval(positionTimer); }
}


function initSocket() {
  socket = io(`${API_HOST}?userType=CITIZEN_SOCKET_TYPE`);
  socket.on('CITIZEN_AUTH_SUCCESS_EVENT', () => {
    initPositionTimer();
    mainHospitals();
  });

  socket.on('ACCEPTED_REQUEST_EVENT', acceptedRequestHandler);
  socket.on('REJECTED_REQUEST_EVENT', rejectedRequestHandler);
  socket.on('OTHER_CITIZEN_SELECTION_EVENT', otherCitizenSelectionHandler);
  socket.on('AMBULANCE_POSITION_CHANGE_EVENT', ambulanceChangePositionHandler);
  socket.on('MISSION_ACCOMPLISHED_EVENT', missionAccomplishedJHandler);

  // Error events
  socket.on('ALARM_NOT_FOUND_EVENT', () => console.log('ALARM_NOT_FOUND_EVENT'));
  socket.on('UNAUTHORIZED_FEEDBACK_EVENT', () => console.log('UNAUTHORIZED_FEEDBACK_EVENT'));
  socket.on('BAD_REQUEST_EVENT', () => console.log('BAD_REQUEST_EVENT'));

  socket.on('ACCOUNT_DEACTIVATED_EVENT', accountDeactivatedHandler);
  /*
  #!!
  */

  socket.on('connect', () => {
    socket.emit('CITIZEN_AUNTENTICATION_EVENT', { token: tokenVar });
  });
}

/* DOM event handlers */
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

  fetch(`${API_HOST}/api/citizens/signin`,
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
      localStorage.setItem('token', tokenVar);
      loginDiv.className = 'hidden';
      initSocket();
    })
    .catch((err) => {
      console.log('err :');
      console.log(err);
    });
}

function addFeedback() {
  if (!currentAlarmId) return;
  missionAccomplishedDiv.className = 'hidden';
  feedbackDiv.className = 'visible';
}

function sendFeedbackAndBackToHospitalsList() {
  const message = {
    alarm_id: currentAlarmId,
    percentage: feedbackPercentage.options[feedbackPercentage.selectedIndex].value,
    comment: feedbackComment.value,
  };

  socket.emit('CITIZEN_FEEDBACK_EVENT', message);
  feedbackDiv.className = 'hidden';
  hospitalsDiv.className = 'visible';
}

function selectOtherAmbulance() {
  selectOtherAmbulanceDiv.className = 'hidden';
  ambulancesDiv.className = 'visible';
  currentAlarmId = null;
}

function removeToken() {
  localStorage.removeItem('token');
}

function cancelAlarm() {
  console.log(`currentAlarmId :${currentAlarmId}`);
  socket.emit('CANCEL_ALARM_EVENT', { alarm_id: currentAlarmId });
}


if (tokenVar) {
  loginDiv.className = 'hidden';
  initSocket();
}
