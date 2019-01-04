import { POSTData } from '../helpers/apiHelper';
import ActionTypes from './ActionTypes';

export function signInRequest(login, password) {
  return new Promise((resolve, reject) => {
    POSTData('/api/partners/signin', { login, password }, true)
      .then((response) => {
        resolve(response);
      })
      .catch((response) => {
        response.json().then((jsonResponse) => {
          console.log(response);
          console.log(jsonResponse);
          if (response.status === 404) { return reject({ login: jsonResponse.msg }); }
          return reject({ password: jsonResponse.msg });
        });
      });
  });
}
