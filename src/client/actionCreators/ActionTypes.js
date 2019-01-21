import keyMirror from 'keymirror';

const ActionTypes = keyMirror({
  UPDATE_CONNECTION_STATE: null,
  FETCH_HOSPITALS: null,
  FETCH_AMBULANCES: null,
  MODIFY_HOSPITAL: null,
  REMOVE_HOSPITAL: null,
  ADD_HOSPITAL: null,
  MODIFY_AMBULANCE: null,
  REMOVE_AMBULANCE: null
});

export default ActionTypes;
