const _ = require('lodash');
const GenericDAO = require('../../../dao/genericDAO');
const Partner = require('../../../bo/partner.bo');

const LOGIN_DUPLICATION_ERROR = 'Login already used';
/*
    * @function
    * @description : save a partner in the database
    * @param{request}[Object] : the http request object
    * @param{response}[Object] : the http response object
    * @Response body :
      - 400, 405 :
        {
          success : <boolean>,
          error : <Object>
        }
      - 201 :
        {
          success : <boolean>
        }
*/
function savePartner(request, response, dataKeys) {
  const partner = new Partner(_.pick(request.body, dataKeys));
  GenericDAO.save(partner)
    .then(() => {
      response.status(201).json({ success: true });
    })
    .catch(() => response.status(405).json({ success: false, error: LOGIN_DUPLICATION_ERROR }));
}

module.exports = savePartner;
