
import { TOKEN_LOCALSTORAGE_KEY } from '../../../config/app_config.json';

export default function addTokenToStorage(token, rememberMe) {
  if (rememberMe) {
    localStorage.setItem(TOKEN_LOCALSTORAGE_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_LOCALSTORAGE_KEY, token);
  }
}
