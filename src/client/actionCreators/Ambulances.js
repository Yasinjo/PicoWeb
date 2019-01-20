import ActionTypes from './ActionTypes';
import getTokenFromStorage from '../helpers/getTokenFromStorage';
import {
  GETData, POSTData, PATCHData, DELETEData
} from '../helpers/apiHelper';

export function fetchAmbulances(dispatch) {
  const token = getTokenFromStorage();
  GETData('/api/ambulances', null, token)
    .then(result => result.json())
    .then((result) => {
      const action = { type: ActionTypes.FETCH_AMBULANCES, data: result.ambulances };
      dispatch(action);
    })
    .catch((error) => {
      throw error;
    });
}
