const jwt = require('jsonwebtoken');
const authConfig = require('../../../config/auth.json');
const GnericDAO = require('../dao/genericDAO');

function splitToken(tokenParam) {
  const splitResult = tokenParam.split(' ');
  const token = (splitResult.length > 1) ? splitResult[1] : tokenParam;
  return token;
}

function extractUserIdFromToken(tokenParam) {
  const token = splitToken(tokenParam);

  return new Promise((resolve, reject) => {
    jwt.verify(token, authConfig.secret,
      (err, decoded) => ((!err && decoded) ? resolve(decoded._id) : reject(err)));
  });
}

function extractUserObjectFromToken(businessSchema, tokenParam) {
  return new Promise((resolve, reject) => {
    extractUserIdFromToken(tokenParam)
      .then((id) => {
        GnericDAO.findOne(businessSchema, { _id: id }, (err, userObject) => {
          if (err || !userObject) { return reject({ err, msg: 'User not found' }); }
          return resolve(userObject);
        });
      })
      .catch(err => reject(err));
  });
}

module.exports = {
  extractUserIdFromToken,
  extractUserObjectFromToken
};
