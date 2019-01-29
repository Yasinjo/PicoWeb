import ActionTypes from './ActionTypes';
import getTokenFromStorage from '../helpers/getTokenFromStorage';
import objectDataToFormData from '../helpers/objectDataToFormData';
import {
  GETData, POSTData, PATCHData, DELETEData
} from '../helpers/apiHelper';

import { PHONE_NUMBER_ALREADY_EXISTS } from '../constants.json';

export function fetchDrivers(dispatch) {
  const token = getTokenFromStorage();
  GETData('/api/drivers', null, token)
    .then(result => result.json())
    .then((result) => {
      const action = { type: ActionTypes.FETCH_DRIVERS, data: result.drivers };
      dispatch(action);
    })
    .catch((error) => {
      throw error;
    });
}


export function modifyDriverHelper(dispatch, driverId, driverData) {
  return new Promise((resolve, reject) => {
    const token = getTokenFromStorage();
    const data = objectDataToFormData(driverData);

    PATCHData(`/api/drivers/${driverId}`, data, false, token)
      .then(() => {
        if (driverData.image) { return window.location.reload(); }

        const action = {
          type: ActionTypes.MODIFY_DRIVER,
          data: {
            driverId, driverData
          }
        };

        dispatch(action);

        return resolve();
      })
      .catch((response) => {
        console.log('modifyDriverHelper Error');
        console.log(response);
        reject(PHONE_NUMBER_ALREADY_EXISTS);
      });
  });
}

export function removeDriverHelper(dispatch, driverId) {
  const token = getTokenFromStorage();
  DELETEData(`/api/drivers/${driverId}`, null, false, token)
    .then(() => {
      const action = {
        type: ActionTypes.REMOVE_DRIVER,
        data: { driverId }
      };

      dispatch(action);
    })
    .catch((response) => {
      console.log('removeDriverHelper Error');
      console.log(response);
    });
}

export function addDriverHelper(dispatch, driverData) {
  return new Promise((resolve, reject) => {
    const token = getTokenFromStorage();
    const data = objectDataToFormData(driverData);

    POSTData('/api/drivers', data, false, token)
      .then(() => {
        fetchDrivers(dispatch);
        return resolve();
      })
      .catch((response) => {
        console.log('addAmbulanceHelper Error');
        console.log(response);
        response.json(err => console.log(err));
        reject(PHONE_NUMBER_ALREADY_EXISTS);
      });
  });
}
