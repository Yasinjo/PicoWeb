
const express = require('express');
const passport = require('passport');
const GenericDAO = require('../../dao/genericDAO');
const Hospital = require('../../bo/hospital.bo');
const { CITIZEN_AUTH_STRATEGY_NAME } = require('../citizens/index');

const router = express.Router();

function getToken(headers) {
  if (headers && headers.authorization) {
    const parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    }
    return null;
  }
  return null;
}

router.get('/', passport.authenticate(CITIZEN_AUTH_STRATEGY_NAME, { session: false }), (request, response, next) => {
  const token = getToken(request.headers);
  if (token) {
    return GenericDAO.find(Hospital, {}, (err, hospitals) => {
      if (err) return next(err);
      return response.status(200).send({ success: true, hospitals });
    });
  }

  return response.status(403).send({ success: false });
});

module.exports = {
  router
};
