import keyMirror from 'keymirror';

const ActionTypes = keyMirror({
  UPDATE_CONNECTION_STATE: null,

  FETCH_HOSPITALS: null,
  MODIFY_HOSPITAL: null,
  REMOVE_HOSPITAL: null,
  ADD_HOSPITAL: null,

  FETCH_ALL_HOSPITALS: null,


  FETCH_AMBULANCES: null,
  MODIFY_AMBULANCE: null,
  REMOVE_AMBULANCE: null,
  ADD_AMBULANCE: null,

  FETCH_DRIVERS: null,
  MODIFY_DRIVER: null,
  REMOVE_DRIVER: null
});

export default ActionTypes;
