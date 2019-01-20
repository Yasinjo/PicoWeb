import ActionTypes from './ActionTypes';
import getTokenFromStorage from '../helpers/getTokenFromStorage';
import { GETData, PATCHData, DELETEData } from '../helpers/apiHelper';

export function fetchHospitals(dispatch) {
  const token = getTokenFromStorage();
  GETData('/api/hospitals/partners', null, token)
    .then(result => result.json())
    .then((result) => {
      const action = { type: ActionTypes.FETCH_HOSPITALS, data: result.hospitals };
      dispatch(action);
    })
    .catch((error) => {
      throw error;
    });
}

export function modifyHospitalHelper(dispatch, hospitalId, hospitalData) {
  const token = getTokenFromStorage();
  PATCHData(`/api/hospitals/partners/${hospitalId}`, hospitalData, true, token)
    .then(() => {
      const action = {
        type: ActionTypes.MODIFY_HOSPITAL,
        data: {
          hospitalId, hospitalData
        }
      };

      dispatch(action);
    })
    .catch((response) => {
      console.log('Error');
      console.log(response);
    });
}

export function removeHospitalHelper(hospitalId, dispatch) {
  const token = getTokenFromStorage();
  DELETEData(`/api/hospitals/partners/${hospitalId}`, null, false, token)
    .then(() => {
      const action = {
        type: ActionTypes.REMOVE_HOSPITAL,
        data: { hospitalId }
      };

      dispatch(action);
    })
    .catch((response) => {
      console.log('Error');
      console.log(response);
    });
}