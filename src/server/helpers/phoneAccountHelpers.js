const _ = require('lodash');
const { PhoneAccount } = require('../bo/phone_account.bo');
const GenericDAO = require('../dao/genericDAO');

function savePhoneAccount(accountData, type) {
  const dataKeys = ['phone_number', 'password', 'latitude', 'longitude'];
  const data = _.pick(accountData, dataKeys);
  data.type = type;
  const account = new PhoneAccount(data);
  return GenericDAO.save(account);
}

function findPhoneAccountFromUserId(BOSchema, id) {
  return new Promise((resolve, reject) => {
    GenericDAO.findOne(BOSchema, { _id: id }, (err, businessObject) => {
      if (err || businessObject === null) { reject(err); }
      GenericDAO.findOne(PhoneAccount, { _id: businessObject.phone_account_id },
        (err2, phoneAccount) => {
          if (err2 || !phoneAccount) reject(err);
          resolve({ businessObject, phoneAccount });
        });
    });
  });
}

module.exports = {
  savePhoneAccount,
  findPhoneAccountFromUserId
};
