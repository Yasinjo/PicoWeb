const Partner = require('../../../bo/partner.bo');
const GenericDAO = require('../../../dao/genericDAO');
const createToken = require('../../../auth/createToken');

const WRONG_PASSWORD = 'Wrong password.';
const PARTNER_NOT_FOUND = 'Account not found';

function validatePartnerAuth(login, password) {
  return new Promise((resolve, reject) => {
    GenericDAO.findOne(Partner, { login },
      (err, partnerAccount) => {
        if (err || !partnerAccount) { return reject({ status: 404, msg: PARTNER_NOT_FOUND }); }
        return partnerAccount.comparePassword(password, (errComp, isMatch) => {
          if (!errComp && isMatch) { return resolve(partnerAccount); }
          return reject({ status: 401, msg: WRONG_PASSWORD });
        });
      });
  });
}

function signinPartner(request, response) {
  const { login, password } = request.body;
  validatePartnerAuth(login, password)
    .then((partner) => {
      // If everything is correct, create a token
      const token = createToken(partner._id);
      // Send the token in the response
      response.status(200).send({ success: true, token });
    }).catch(({ msg, status }) => {
      // If there is an error, send it in the response
      response.status(status).send({ success: false, msg });
    });
}

module.exports = signinPartner;
