import ActionTypes from './ActionTypes';
import getTokenFromStorage from '../helpers/getTokenFromStorage';
import { GETData } from '../helpers/apiHelper';

export function fetchHospitals(dispatch) {
  const token = getTokenFromStorage();
  GETData('/hospitals/partners', null, token)
    .then(result => result.json())
    .then((result) => {
      const action = { type: ActionTypes.FETCH_HOSPITALS, data: result };
      dispatch(action);
    })
    .catch((error) => {
      error.json((jsonError) => {
        throw jsonError;
      });
    });
}
