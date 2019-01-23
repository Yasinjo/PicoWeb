import ActionTypes from './ActionTypes';
import getTokenFromStorage from '../helpers/getTokenFromStorage';
import {
  GETData
} from '../helpers/apiHelper';

export function fetchAllHospitals(dispatch) {
  return new Promise((resolve, reject) => {
    const token = getTokenFromStorage();
    GETData('/api/hospitals/partners/all', null, token)
      .then(result => result.json())
      .then((result) => {
        const action = { type: ActionTypes.FETCH_ALL_HOSPITALS, data: result.hospitals };
        dispatch(action);
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}
