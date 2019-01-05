
import { TOKEN_LOCALSTORAGE_KEY } from '../../../config/app_config.json';

export default function addTokenToStorage(token) {
  return localStorage.setItem(TOKEN_LOCALSTORAGE_KEY, token);
}
