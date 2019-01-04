
const jwt = require('jsonwebtoken');
const authConfig = require('../../../config/auth.json');

function createToken(id) {
  const token = jwt.sign({ _id: id }, authConfig.secret);
  return `JWT ${token}`;
}

module.exports = createToken;
