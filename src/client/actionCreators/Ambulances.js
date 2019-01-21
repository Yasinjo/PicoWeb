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

export function modifyAmbulanceHelper(dispatch, ambulanceId, ambulanceData) {
  const token = getTokenFromStorage();
  const data = new FormData();
  const keys = Object.keys(ambulanceData);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (Array.isArray(ambulanceData[key])) {
      for (let j = 0; j < ambulanceData[key].length; j += 1) {
        data.append(key, ambulanceData[key][j]);
      }
    } else { data.append(key, ambulanceData[key]); }
  }

  PATCHData(`/api/ambulances/${ambulanceId}`, data, false, token)
    .then(() => {
      const action = {
        type: ActionTypes.MODIFY_AMBULANCE,
        data: {
          ambulanceId, ambulanceData
        }
      };

      dispatch(action);
    })
    .catch((response) => {
      console.log('modifyAmbulanceHelper Error');
      console.log(response);
      response.json().then((json) => {
        console.log('json');
        console.log(json);
      });
    });
}

export function removeAmbulanceHelper(dispatch, ambulanceId) {
  const token = getTokenFromStorage();
  DELETEData(`/api/ambulances/${ambulanceId}`, null, false, token)
    .then(() => {
      const action = {
        type: ActionTypes.REMOVE_AMBULANCE,
        data: { ambulanceId }
      };

      dispatch(action);
    })
    .catch((response) => {
      console.log('Error');
      console.log(response);
    });
}
