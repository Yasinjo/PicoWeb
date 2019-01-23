const getToken = require('../../../helpers/getToken');
const { extractUserIdFromToken } = require('../../../auth/tokenExtractors');
const { PhoneAccount } = require('../../../bo/phone_account.bo');
const Driver = require('../../../bo/driver.bo');

const GenericDAO = require('../../../dao/genericDAO');


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

module.exports = {
  getDriversByPartner
};
