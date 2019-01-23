const getToken = require('../../../helpers/getToken');
const { extractUserIdFromToken } = require('../../../auth/tokenExtractors');
const { PhoneAccount } = require('../../../bo/phone_account.bo');
const { findPhoneAccountFromUserId } = require('../../../helpers/phoneAccountHelpers');
const { uploadPictureHelper } = require('../../../helpers/uploadPictureHelper');
const Driver = require('../../../bo/driver.bo');
const GenericDAO = require('../../../dao/genericDAO');

const DRIVERS_REPO_NAME = 'DRIVERS_REPO_NAME';

function addPhoneNumbers(drivers, i, callback) {
  if (i === drivers.length) return callback();

  return GenericDAO.findOne(PhoneAccount, { _id: drivers[i].phone_account_id },
    (err2, phoneAccount) => {
      if (phoneAccount) { drivers[i]._doc.phone_number = phoneAccount.phone_number; }
      addPhoneNumbers(drivers, i + 1, callback);
    });
}

function getDriversByPartner(request, response) {
  const token = getToken(request.headers);
  extractUserIdFromToken(token)
    .then((partnerId) => {
      GenericDAO.find(Driver, { partner_id: partnerId }, (err, drivers) => {
      // If there is an error, send it in response
        if (err) response.status(500).send(err);
        // Otherwise, send the hospitals in response

        addPhoneNumbers(drivers, 0, () => response.status(200).send({ success: true, drivers }));
      });
    });
}

function verifyPartnerRightOnDriver(request, driverId) {
  // Get the token from the request
  const token = getToken(request.headers);
  // verify the rights
  return new Promise((resolve, reject) => {
    extractUserIdFromToken(token)
      .then((partnerId) => {
        GenericDAO.findOne(Driver, { _id: driverId, partner_id: partnerId },
          (err, driver) => {
            if (err || !driver) { return reject(); }
            return resolve();
          });
      });
  });
}

function phoneNumberIsUnique(phoneAccountId, phoneNumber) {
  return new Promise((resolve, reject) => {
    GenericDAO.findOne(Driver, { phone_number: phoneNumber }, (err, phoneAccount) => {
      // If there is an error, send it in response
      if (err) return reject();
      if (!phoneAccount || phoneAccount._id === phoneAccountId) return resolve();
      return reject();
    });
  });
}

function updateDriverPhoneNumber(phoneAccountId, newPhoneNumber) {
  return new Promise((resolve, reject) => {
    GenericDAO.updateFields(PhoneAccount, { _id: phoneAccountId }, { phone_number: newPhoneNumber },
      (err) => {
        if (err) return reject();
        return resolve();
      });
  });
}

function updateDriverName(driverId, newFullName) {
  return new Promise((resolve, reject) => {
    GenericDAO.updateFields(Driver, { _id: driverId }, { full_name: newFullName },
      (err) => {
        if (err) return reject();
        return resolve();
      });
  });
}

function updateDriver(request, response, driverId) {
  let phoneObject;

  verifyPartnerRightOnDriver(request, driverId)
    .then(() => findPhoneAccountFromUserId(Driver, driverId))
    .then(({ phoneAccount }) => {
      phoneObject = phoneAccount;
      return phoneNumberIsUnique(phoneObject._id, request.body.phone_number);
    })
    .then(() => updateDriverPhoneNumber(phoneObject._id, request.body.phone_number))
    .then(() => updateDriverName(driverId, request.body.full_name))
    .then(() => {
      // console.log
      if (request.file && request.file.buffer) {
        uploadPictureHelper(request.file.buffer, driverId,
          DRIVERS_REPO_NAME, () => {});
      }

      response.status(202).send();
    })
    .catch(() => response.status(400).send());
}

module.exports = {
  getDriversByPartner,
  updateDriver
};
