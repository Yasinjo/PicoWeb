
import { TOKEN_LOCALSTORAGE_KEY } from '../../../config/app_config.json';

export default function removeTokenFromStorage() {
  localStorage.removeItem(TOKEN_LOCALSTORAGE_KEY);
  sessionStorage.removeItem(TOKEN_LOCALSTORAGE_KEY);
}
