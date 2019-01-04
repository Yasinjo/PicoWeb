import { POSTData } from './apiHelper';

export default function verifyToken(token) {
  return POSTData('/api/partners/validate_token', null, false, token);
}
