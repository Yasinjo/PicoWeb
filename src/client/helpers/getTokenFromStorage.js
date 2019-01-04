
import { TOKEN_LOCALSTORAGE_KEY } from '../../../config/app_config.json';

export default function getTokenFromStorage() {
  return localStorage.getItem(TOKEN_LOCALSTORAGE_KEY);
}
