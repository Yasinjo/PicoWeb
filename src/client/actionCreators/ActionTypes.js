import keyMirror from 'keymirror';

const ActionTypes = keyMirror({
  UPDATE_CONNECTION_STATE: null,
  FETCH_HOSPITALS: null,
  MODIFY_HOSPITAL: null,
  REMOVE_HOSPITAL: null,
  ADD_HOSPITAL: null
});

export default ActionTypes;
