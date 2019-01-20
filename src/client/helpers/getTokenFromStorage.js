
import { TOKEN_LOCALSTORAGE_KEY } from '../../../config/app_config.json';

export default function getTokenFromStorage() {
  const localStorageItem = localStorage.getItem(TOKEN_LOCALSTORAGE_KEY);
  if (localStorageItem) return localStorageItem;
  return sessionStorage.getItem(TOKEN_LOCALSTORAGE_KEY);
}
