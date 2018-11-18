const _ = require('lodash');

function verifyRequiredFields(request, response, requiredKeys) {
  return new Promise((resolve) => {
    const requiredKeysTest = _.every(requiredKeys, _.partial(_.has, request.body));
    if (requiredKeysTest) resolve();
    else response.status(400).json({ success: false, msg: 'Please provide all the required data.' });
  });
}

module.exports = verifyRequiredFields;
