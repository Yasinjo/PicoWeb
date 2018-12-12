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

module.exports = {
  savePhoneAccount
};
