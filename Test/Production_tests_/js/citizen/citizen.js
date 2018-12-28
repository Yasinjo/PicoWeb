const API_HOST = 'http://localhost:9090';
// const API_HOST = 'http://pico.ossrv.nl:9090';

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

let tokenVar = localStorage.getItem('token');
let socket;

function sendAlarm(ambulanceId) {
  labelDiv.className = 'visible';
  labelDiv.innerHTML = '<b>Sending alarm</b>';
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

function addAmbulanceRow(row, ambulance) {
  const registrationNumber = row.insertCell(0);
  const latitude = row.insertCell(1);
  const longitude = row.insertCell(2);
  const select = row.insertCell(3);

  registrationNumber.innerHTML = ambulance.registration_number;
  longitude.innerHTML = ambulance.longitude;
  latitude.innerHTML = ambulance.latitude;

  const selectButton = createAmbulanceSelectionButton(ambulance._id);
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

function initSocket() {
  socket = io(`${API_HOST}?userType=CITIZEN_SOCKET_TYPE`);
  socket.on('CITIZEN_AUTH_SUCCESS_EVENT', () => mainHospitals());
  socket.on('connect', () => {
    socket.emit('CITIZEN_AUNTENTICATION_EVENT', { token: tokenVar });
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

if (tokenVar) {
  loginDiv.className = 'hidden';
  initSocket();
}
