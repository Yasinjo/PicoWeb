const express = require('express');
const _ = require('lodash');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authConfig = require('../../../../config/auth.json');

const verifyRequiredFields = require('../../helpers/verifyRequiredFields');
const GenericDAO = require('../../dao/genericDAO');
const Citizen = require('../../bo/citizen.bo');
const { uploadPictureHelper, uploadMiddleware } = require('../../helpers/uploadPictureHelper');
const addAuthStrategy = require('../../auth/addAuthStrategy');

const PHONE_DUPLICATION_ERROR = 'Phone number already used';
const CITIZEN_NOT_FOUND = 'Authentication failed. citizen not found.';
const DEACTIVATED_ACCOUNT = 'Your account has been disabled because of a false alarm.';
const WRONG_PASSWORD = 'Authentication failed. Wrong password.';
const router = express.Router();

addAuthStrategy(passport, Citizen, 'Citizen-strategy');

function validateCitizen(requestBody) {
  return new Promise((resolve, reject) => {
    Citizen.findOne({
      phone_number: requestBody.phone_number
    })
      .then((citizen) => {
        citizen.comparePassword(requestBody.password, (err, isMatch) => {
          if (isMatch && !err) {
            if (citizen.isActive()) resolve(citizen);
            else reject({ msg: DEACTIVATED_ACCOUNT, status: 403 });
          } else { reject({ msg: WRONG_PASSWORD, status: 400 }); }
        });
      })
      .catch(() => reject({ msg: CITIZEN_NOT_FOUND, status: 400 }));
  });
}

router.post('/signup', uploadMiddleware.single('image'), (request, response) => {
  const requiredKeys = ['phone_number', 'password', 'full_name', 'latitude', 'longitude'];

  verifyRequiredFields(request, response, requiredKeys).then(() => {
    const citizen = new Citizen(_.pick(request.body, requiredKeys));
    GenericDAO.save(citizen)
      .then(() => {
        if (request.file && request.file.buffer) {
          uploadPictureHelper(request.file.buffer, request.body.phone_number, () => {
            response.status(201).json({ success: true });
          });
        } else { response.status(201).json({ success: true }); }
      })
      .catch(() => {
        response.status(400).json({ success: false, error: PHONE_DUPLICATION_ERROR });
      });
  });
});

router.post('/signin', (req, res) => {
  validateCitizen(req.body).then((citizen) => {
    const token = jwt.sign(citizen.toJSON(), authConfig.secret);
    res.status(200).send({ success: true, token: `JWT ${token}` });
  }).catch(({ msg, status }) => {
    res.status(status).send({ success: false, msg });
  });
});

module.exports = router;
