const jwt = require('jsonwebtoken');
const authConfig = require('../../../config/auth.json');

function extractUserIdFromToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, authConfig.secret,
      (err, decoded) => ((!err && decoded) ? resolve(decoded._id) : reject()));
  });
}

module.exports = {
  extractUserIdFromToken
};
