import { GETData, POSTData } from '../helpers/apiHelper';
import ActionTypes from './ActionTypes';

export function signInRequest(login, password) {
  return new Promise((resolve, reject) => {
    POSTData('/api/partners/signin', { login, password }, true)
      .then((response) => {
        console.log('response :');
        console.log(response);
        resolve();
      })
      .catch((response) => {
        console.log('response');
        console.log(response);
      });
  });
}
