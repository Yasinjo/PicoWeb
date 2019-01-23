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
