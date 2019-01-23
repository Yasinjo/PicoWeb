import ActionTypes from './ActionTypes';
import getTokenFromStorage from '../helpers/getTokenFromStorage';
import objectDataToFormData from '../helpers/objectDataToFormData';
import {
  GETData, POSTData, PATCHData, DELETEData
} from '../helpers/apiHelper';


export function fetchAmbulances(dispatch) {
  return new Promise((resolve, reject) => {
    const token = getTokenFromStorage();
    GETData('/api/ambulances', null, token)
      .then(result => result.json())
      .then((result) => {
        const action = { type: ActionTypes.FETCH_AMBULANCES, data: result.ambulances };
        dispatch(action);
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function modifyAmbulanceHelper(dispatch, ambulanceId, ambulanceData) {
  const token = getTokenFromStorage();
  const data = objectDataToFormData(ambulanceData);

  console.log('ambulanceData');
  console.log(ambulanceData);

  PATCHData(`/api/ambulances/${ambulanceId}`, data, false, token)
    .then(() => {
      const action = {
        type: ActionTypes.MODIFY_AMBULANCE,
        data: {
          ambulanceId, ambulanceData
        }
      };

      dispatch(action);
      fetchAmbulances(dispatch);
    })
    .catch((response) => {
      console.log('modifyAmbulanceHelper Error');
      console.log(response);
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

export function addAmbulanceHelper(dispatch, ambulanceData) {
  const token = getTokenFromStorage();
  const data = objectDataToFormData(ambulanceData);

  POSTData('/api/ambulances', data, false, token)
    .then(response => response.json())
    .then((jsonResponse) => {
      const action = {
        type: ActionTypes.ADD_AMBULANCE,
        data: {
          ambulanceId: jsonResponse.ambulance_id,
          ambulanceData
        }
      };

      dispatch(action);
    })
    .catch((response) => {
      console.log('modifyAmbulanceHelper Error');
      console.log(response);
      response.json().then((jsonResponse) => {
        console.log('jsonResponse');
        console.log(jsonResponse);
      });
    });
}
