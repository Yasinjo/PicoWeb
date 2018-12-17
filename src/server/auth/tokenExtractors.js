const jwt = require('jsonwebtoken');
const authConfig = require('../../../config/auth.json');

function extractUserIdFromToken(tokenParam) {
  const splitResult = tokenParam.split(' ');
  const token = (splitResult.length > 1) ? splitResult[1] : tokenParam;

  return new Promise((resolve, reject) => {
    jwt.verify(token, authConfig.secret,
      (err, decoded) => ((!err && decoded) ? resolve(decoded._id) : reject(err)));
  });
}

module.exports = {
  extractUserIdFromToken
};
