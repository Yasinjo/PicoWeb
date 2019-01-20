import { POSTData } from '../helpers/apiHelper';
import createActionObject from '../helpers/createActionObject';

import ActionTypes from './ActionTypes';

export function signInRequest(login, password) {
  return new Promise((resolve, reject) => {
    POSTData('/api/partners/signin', { login, password }, true)
      .then(successResponse => successResponse.json())
      .then(jsonSuccessResponse => resolve(jsonSuccessResponse.token))
      .catch((response) => {
        response.json().then((jsonResponse) => {
          if (response.status === 404) { return reject({ login: jsonResponse.msg }); }
          return reject({ password: jsonResponse.msg });
        });
      });
  });
}

export function partnerIsConnected(connected, dispatch) {
  const action = createActionObject(ActionTypes.UPDATE_CONNECTION_STATE, connected);
  dispatch(action);
}
